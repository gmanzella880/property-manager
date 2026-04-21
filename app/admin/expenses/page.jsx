import prisma from "@/lib/prisma";
import ExpenseTracker from "./expense-tracker";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Expenses — PropertyBase" };

export default async function ExpensesPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const property = propertyId ? await prisma.property.findUnique({ where: { id: propertyId } }) : null;
  const ownerLandlordId = property?.landlordId || landlord.id;
  const scope = unitWhere(propertyId);

  const expenses = await prisma.expense.findMany({
    where: { unit: scope },
    include: {
      unit: { select: { id: true, unitNumber: true } },
      vendor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const units = await prisma.unit.findMany({
    where: scope,
    select: { id: true, unitNumber: true },
    orderBy: { unitNumber: "asc" },
  });

  const vendors = await prisma.vendor.findMany({
    where: { landlordId: ownerLandlordId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">{expenses.length} total expenses</p>
      </div>

      <ExpenseTracker
        expenses={JSON.parse(JSON.stringify(expenses))}
        units={JSON.parse(JSON.stringify(units))}
        vendors={JSON.parse(JSON.stringify(vendors))}
      />
    </div>
  );
}
