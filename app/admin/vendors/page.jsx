import prisma from "@/lib/prisma";
import VendorsManager from "./vendors-manager";
import { requireLandlord, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vendors — PropertyBase" };

export default async function VendorsPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const property = propertyId ? await prisma.property.findUnique({ where: { id: propertyId } }) : null;
  const ownerLandlordId = property?.landlordId || landlord.id;

  const vendors = await prisma.vendor.findMany({
    where: { landlordId: ownerLandlordId },
    include: {
      _count: { select: { tickets: true, expenses: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-sm text-gray-500 mt-1">{vendors.length} vendors</p>
      </div>

      <VendorsManager vendors={JSON.parse(JSON.stringify(vendors))} />
    </div>
  );
}
