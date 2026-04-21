import AdminShell from "./admin-shell";
import { requireLandlord } from "@/lib/landlord";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }) {
  let role = "admin";
  let properties = [];
  let selectedPropertyId = null;

  try {
    const landlord = await requireLandlord();
    role = landlord.role;

    // Super admin sees ALL properties; regular admin sees only theirs
    if (role === "super_admin") {
      properties = await prisma.property.findMany({
        include: { landlord: { select: { name: true } } },
        orderBy: { name: "asc" },
      });
    } else {
      properties = await prisma.property.findMany({
        where: { landlordId: landlord.id },
        include: { landlord: { select: { name: true } } },
        orderBy: { name: "asc" },
      });
    }

    const cookieStore = await cookies();
    selectedPropertyId = cookieStore.get("selectedPropertyId")?.value || null;

    // If no selection or invalid selection, default to first property
    if (!selectedPropertyId || !properties.find((p) => p.id === selectedPropertyId)) {
      selectedPropertyId = properties[0]?.id || null;
    }
  } catch {
    // Not authenticated yet (redirect will happen)
  }

  return (
    <AdminShell
      role={role}
      properties={JSON.parse(JSON.stringify(properties))}
      selectedPropertyId={selectedPropertyId}
    >
      {children}
    </AdminShell>
  );
}
