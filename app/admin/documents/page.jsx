import prisma from "@/lib/prisma";
import DocumentsManager from "./documents-manager";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Documents — PropertyBase" };

export default async function DocumentsPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const scope = unitWhere(propertyId);

  const documents = await prisma.document.findMany({
    where: { unit: scope },
    include: {
      tenant: { select: { name: true } },
      unit: { select: { unitNumber: true } },
      ticket: { select: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tenants = await prisma.tenant.findMany({
    where: { unit: scope },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const units = await prisma.unit.findMany({
    where: scope,
    select: { id: true, unitNumber: true },
    orderBy: { unitNumber: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">{documents.length} documents</p>
      </div>

      <DocumentsManager
        documents={JSON.parse(JSON.stringify(documents))}
        tenants={JSON.parse(JSON.stringify(tenants))}
        units={JSON.parse(JSON.stringify(units))}
      />
    </div>
  );
}
