import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Gets the current landlord from the Logto session.
 * Auto-creates the landlord record on first login.
 * Redirects to sign-in if not authenticated.
 */
export async function requireLandlord() {
  let isAuthenticated, claims;
  try {
    ({ isAuthenticated, claims } = await getLogtoContext(logtoConfig, {
      fetchUserInfo: true,
    }));
  } catch {
    // Token expired or invalid — treat as unauthenticated
    redirect("/sign-in");
  }

  if (!isAuthenticated || !claims) {
    redirect("/sign-in");
  }

  let landlord = await prisma.landlord.findUnique({
    where: { authId: claims.sub },
  });

  if (!landlord) {
    // First user ever becomes super_admin
    const count = await prisma.landlord.count();
    const role = count === 0 ? "super_admin" : "admin";

    try {
      landlord = await prisma.landlord.create({
        data: {
          authId: claims.sub,
          name: claims.name || claims.username || "User",
          email: claims.email || "",
          phone: claims.phone_number || "",
          role,
        },
      });
    } catch (e) {
      // Race condition: another request already created this landlord
      landlord = await prisma.landlord.findUnique({
        where: { authId: claims.sub },
      });
      if (!landlord) throw e;
    }
  }

  return landlord;
}

/**
 * Gets the currently selected property ID from the cookie.
 * Super admins can view any property; regular admins are restricted to their own.
 */
export async function getSelectedPropertyId(landlord) {
  const cookieStore = await cookies();
  const selected = cookieStore.get("selectedPropertyId")?.value;

  if (selected) {
    if (landlord.role === "super_admin") {
      // Super admin can view any property
      const exists = await prisma.property.findUnique({ where: { id: selected } });
      if (exists) return selected;
    } else {
      // Regular admin can only view their own properties
      const exists = await prisma.property.findFirst({
        where: { id: selected, landlordId: landlord.id },
      });
      if (exists) return selected;
    }
  }

  // Fallback: first property they have access to
  const fallback = landlord.role === "super_admin"
    ? await prisma.property.findFirst({ orderBy: { name: "asc" } })
    : await prisma.property.findFirst({ where: { landlordId: landlord.id }, orderBy: { name: "asc" } });

  return fallback?.id || null;
}

/**
 * Prisma where clause to scope units to the selected property.
 * Returns an impossible match when no property is selected (returns empty results).
 */
export function unitWhere(propertyId) {
  if (!propertyId) return { propertyId: "__no_property__" };
  return { propertyId };
}

/**
 * Prisma where clause to scope units by landlord (legacy, for landlord-owned data).
 */
export function unitWhereByLandlord(landlordId) {
  return { property: { landlordId } };
}
