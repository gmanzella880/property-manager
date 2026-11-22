import prisma from "@/lib/prisma";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";
import { isPeriod, monthStatus, periodOf, addMonths, dateOnlyPeriod } from "@/lib/rent";
import RentBoard from "./rent-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rent — PropertyBase" };

export default async function RentPage({ searchParams }) {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const { month } = await searchParams;
  const period = isPeriod(month) ? month : periodOf();

  const tenants = await prisma.tenant.findMany({
    where: { active: true, unit: unitWhere(propertyId) },
    include: {
      unit: true,
      payments: { where: { period }, orderBy: { paidAt: "asc" } },
    },
    orderBy: { unit: { unitNumber: "asc" } },
  });

  const rows = tenants
    .filter((t) => dateOnlyPeriod(t.leaseStart) <= period)
    .map((t) => ({
      tenant: { id: t.id, name: t.name },
      unitNumber: t.unit.unitNumber,
      ...monthStatus(t.unit.rentAmount * 100, t.payments, period),
      payments: t.payments,
    }));

  return (
    <RentBoard
      period={period}
      prev={addMonths(period, -1)}
      next={addMonths(period, 1)}
      isCurrent={period === periodOf()}
      rows={JSON.parse(JSON.stringify(rows))}
    />
  );
}
