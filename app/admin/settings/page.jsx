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
        include: { landlord: { select: { id: true, name: true, email: true, phone: true } } },
      })
    : null;

  const feedUrl = property
    ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/public/listings/${property.landlord.id}`
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Property and account settings</p>
      </div>

      <SettingsPage property={property ? JSON.parse(JSON.stringify(property)) : null} />

      {feedUrl && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Public website feed</h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste this link into the website editor so the public site shows live vacancies and rent.
            It shares property names, addresses, and the unit number and rent of vacant units only.
          </p>
          <code className="block mt-3 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 break-all select-all">
            {feedUrl}
          </code>
        </div>
      )}
    </div>
  );
}
