import prisma from "@/lib/prisma";
import Link from "next/link";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";
import { Building2, Plus, Search } from "lucide-react";
import UnitsList from "./units-list";

export const metadata = { title: "Units — PropertyBase" };

export default async function UnitsPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);

  const units = await prisma.unit.findMany({
    where: unitWhere(propertyId),
    include: {
      property: true,
      tenant: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { unitNumber: "asc" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units</h1>
          <p className="text-sm text-gray-500 mt-1">{units.length} total units</p>
        </div>
        <Link
          href="/admin/units?modal=add"
          className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2a5280] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </Link>
      </div>

      <UnitsList units={JSON.parse(JSON.stringify(units))} />
    </div>
  );
}
