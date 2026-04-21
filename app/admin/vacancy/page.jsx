import prisma from "@/lib/prisma";
import VacancyPipeline from "./vacancy-pipeline";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vacancy — PropertyBase" };

export default async function VacancyPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const property = propertyId ? await prisma.property.findUnique({ where: { id: propertyId } }) : null;
  const ownerLandlordId = property?.landlordId || landlord.id;
  const scope = unitWhere(propertyId);

  const units = await prisma.unit.findMany({
    where: scope,
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { name: true } },
    },
    orderBy: { unitNumber: "asc" },
  });

  const vacancies = await prisma.vacancy.findMany({
    where: { landlordId: ownerLandlordId },
    include: {
      applicants: {
        include: { documents: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vacancy Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Track vacant units and applicants</p>
      </div>

      <VacancyPipeline
        units={JSON.parse(JSON.stringify(units))}
        vacancies={JSON.parse(JSON.stringify(vacancies))}
      />
    </div>
  );
}
