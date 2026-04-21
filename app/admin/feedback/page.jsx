import prisma from "@/lib/prisma";
import FeedbackList from "./feedback-list";
import { requireLandlord, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export const metadata = { title: "Feedback — PropertyBase" };

export default async function FeedbackPage() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const property = propertyId ? await prisma.property.findUnique({ where: { id: propertyId } }) : null;
  const ownerLandlordId = property?.landlordId || landlord.id;

  const feedback = await prisma.feedback.findMany({
    where: { landlordId: ownerLandlordId },
    include: { tenant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">{feedback.length} submissions</p>
      </div>

      <FeedbackList feedback={JSON.parse(JSON.stringify(feedback))} />
    </div>
  );
}
