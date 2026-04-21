import prisma from "@/lib/prisma";
import MessagesHub from "./messages-hub";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Messages — PropertyBase" };

export default async function MessagesPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);

  const tenants = await prisma.tenant.findMany({
    where: { unit: unitWhere(propertyId) },
    include: {
      unit: { select: { unitNumber: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">SMS communication hub</p>
      </div>

      <MessagesHub tenants={JSON.parse(JSON.stringify(tenants))} />
    </div>
  );
}
