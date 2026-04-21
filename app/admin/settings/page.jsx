import prisma from "@/lib/prisma";
import SettingsPage from "./settings-form";
import { requireLandlord, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — PropertyBase" };

export default async function Settings() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);

  const property = propertyId
    ? await prisma.property.findUnique({
        where: { id: propertyId },
        include: { landlord: { select: { name: true, email: true, phone: true } } },
      })
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Property and account settings</p>
      </div>

      <SettingsPage property={property ? JSON.parse(JSON.stringify(property)) : null} />
    </div>
  );
}
