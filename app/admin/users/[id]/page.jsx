import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserActions from "./user-actions";
import PropertyCard from "./property-card";
import {
  ArrowLeft,
  Building2,
  Users,
  Home,
  ShieldCheck,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await prisma.landlord.findUnique({ where: { id } });
  return { title: `${user?.name || "User"} — PropertyBase` };
}

export default async function UserDetailPage({ params }) {
  const currentLandlord = await requireLandlord();

  if (currentLandlord.role !== "super_admin") {
    redirect("/admin");
  }

  const { id } = await params;

  const user = await prisma.landlord.findUnique({
    where: { id },
    include: {
      properties: {
        include: {
          units: {
            include: {
              tenant: { select: { id: true, name: true, email: true, active: true } },
            },
            orderBy: { unitNumber: "asc" },
          },
        },
      },
      _count: {
        select: {
          vendors: true,
          feedback: true,
          vacancies: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/admin/users");
  }

  const totalUnits = user.properties.reduce((sum, p) => sum + p.units.length, 0);
  const totalTenants = user.properties.reduce(
    (sum, p) => sum + p.units.filter((u) => u.tenant).length,
    0
  );

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.role === "super_admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role === "super_admin" ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <Shield className="w-3 h-3" />
                )}
                {user.role === "super_admin" ? "Super Admin" : "Admin"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <UserActions user={JSON.parse(JSON.stringify(user))} currentUserId={currentLandlord.id} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
          {[
            { label: "Properties", value: user.properties.length, icon: Building2 },
            { label: "Units", value: totalUnits, icon: Home },
            { label: "Tenants", value: totalTenants, icon: Users },
            { label: "Vendors", value: user._count.vendors, icon: Building2 },
            { label: "Feedback", value: user._count.feedback, icon: Building2 },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-gray-50 rounded-lg p-3 text-center"
            >
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Properties & Units */}
      {user.properties.map((property) => (
        <PropertyCard key={property.id} property={JSON.parse(JSON.stringify(property))} userName={user.name} />
      ))}

      {user.properties.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>This user hasn&apos;t created any properties yet</p>
        </div>
      )}
    </div>
  );
}
