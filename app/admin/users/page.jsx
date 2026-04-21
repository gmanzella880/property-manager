import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { redirect } from "next/navigation";
import UsersList from "./users-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users — PropertyBase" };

export default async function UsersPage() {
  const landlord = await requireLandlord();

  if (landlord.role !== "super_admin") {
    redirect("/admin");
  }

  const users = await prisma.landlord.findMany({
    include: {
      properties: {
        include: {
          _count: { select: { units: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all landlords and property managers on the platform
        </p>
      </div>

      <UsersList users={JSON.parse(JSON.stringify(users))} currentUserId={landlord.id} />
    </div>
  );
}
