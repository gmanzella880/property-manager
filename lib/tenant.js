import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

/** Verified email addresses of a Clerk user, lowercased. */
export function verifiedEmails(user) {
  return (user?.emailAddresses || [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
}

/**
 * The active tenant record for the signed-in Clerk user, or null.
 * The first time a tenant signs in, they are matched by verified email and
 * their Clerk id is saved on the tenant, so later lookups need no Clerk call.
 */
export async function tenantForUser(userId) {
  if (!userId) return null;
  let tenant = await prisma.tenant.findUnique({ where: { authId: userId } });
  if (!tenant) {
    const emails = verifiedEmails(await currentUser());
    if (!emails.length) return null;
    const match = await prisma.tenant.findFirst({
      where: {
        authId: null,
        active: true,
        OR: emails.map((email) => ({ email: { equals: email, mode: "insensitive" } })),
      },
      orderBy: { leaseStart: "desc" },
    });
    if (match) {
      try {
        tenant = await prisma.tenant.update({ where: { id: match.id }, data: { authId: userId } });
      } catch {
        // Another request linked it at the same moment
      }
    }
    // A parallel request (pages load several at once) may have just linked it
    tenant ??= await prisma.tenant.findUnique({ where: { authId: userId } });
  }
  return tenant && tenant.active ? tenant : null;
}

/** Whether this Clerk user should be treated as a tenant (never a landlord). */
export async function isTenantUser(user) {
  if (user?.publicMetadata?.role === "tenant") return true;
  const emails = verifiedEmails(user);
  if (!emails.length) return false;
  const count = await prisma.tenant.count({
    where: { OR: emails.map((email) => ({ email: { equals: email, mode: "insensitive" } })) },
  });
  return count > 0;
}

/**
 * For portal pages. Returns the tenant whose portal (slug) may be shown:
 * the signed-in tenant's own portal, or any tenant's portal for a landlord
 * who manages that tenant's property (preview). Everyone else is redirected.
 */
export async function requirePortalAccess(slug) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const own = await tenantForUser(userId);
  if (own) {
    if (slug && own.slug !== slug) redirect(`/portal/${own.slug}`);
    return { tenantId: own.id, preview: false };
  }

  if (slug) {
    const landlord = await prisma.landlord.findUnique({ where: { authId: userId } });
    if (landlord) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, unit: { select: { property: { select: { landlordId: true } } } } },
      });
      if (tenant && (landlord.role === "super_admin" || tenant.unit.property.landlordId === landlord.id)) {
        return { tenantId: tenant.id, preview: true };
      }
    }
  }
  redirect("/portal/no-access");
}

/** For portal API routes: the signed-in tenant, or null (caller returns 403). */
export async function tenantForRequest() {
  const { userId } = await auth();
  return tenantForUser(userId);
}
