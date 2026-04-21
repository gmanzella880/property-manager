import prisma from "@/lib/prisma";
import Link from "next/link";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";
import { Plus } from "lucide-react";
import TenantsList from "./tenants-list";

export const metadata = { title: "Tenants — PropertyBase" };

export default async function TenantsPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const scope = unitWhere(propertyId);

  const tenants = await prisma.tenant.findMany({
    where: { unit: scope },
    include: {
      unit: { include: { property: true } },
    },
    orderBy: { name: "asc" },
  });

  const vacantUnits = await prisma.unit.findMany({
    where: { ...scope, tenant: null },
    include: { property: true },
    orderBy: { unitNumber: "asc" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">{tenants.length} total tenants</p>
        </div>
        <Link
          href="/admin/tenants?modal=add"
          className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2a5280] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </Link>
      </div>

      <TenantsList
        tenants={JSON.parse(JSON.stringify(tenants))}
        vacantUnits={JSON.parse(JSON.stringify(vacantUnits))}
      />
    </div>
  );
}
