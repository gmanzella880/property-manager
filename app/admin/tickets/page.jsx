import prisma from "@/lib/prisma";
import TicketsList from "./tickets-list";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tickets — PropertyBase" };

export default async function TicketsPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);

  const tickets = await prisma.ticket.findMany({
    where: { unit: unitWhere(propertyId) },
    include: {
      tenant: { select: { id: true, name: true } },
      unit: { select: { unitNumber: true } },
      vendor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">{tickets.length} total tickets</p>
      </div>

      <TicketsList tickets={JSON.parse(JSON.stringify(tickets))} />
    </div>
  );
}
