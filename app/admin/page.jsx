import prisma from "@/lib/prisma";
import Link from "next/link";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";
import { Building2, Users, Wrench, Lightbulb, MessageSquare, DoorOpen } from "lucide-react";

export const metadata = { title: "Dashboard — PropertyBase" };

export default async function AdminDashboard() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const scope = unitWhere(propertyId);
  const property = propertyId ? await prisma.property.findUnique({ where: { id: propertyId } }) : null;
  const ownerLandlordId = property?.landlordId || landlord.id;

  const [
    totalUnits,
    occupiedUnits,
    openTickets,
    openFeedback,
    recentTickets,
    recentFeedback,
    recentMessages,
  ] = await Promise.all([
    prisma.unit.count({ where: scope }),
    prisma.unit.count({ where: { ...scope, tenant: { isNot: null } } }),
    prisma.ticket.count({ where: { unit: scope, status: { not: "closed" } } }),
    prisma.feedback.count({ where: { landlordId: ownerLandlordId, status: "open" } }),
    prisma.ticket.findMany({
      where: { unit: scope },
      include: { tenant: { select: { name: true } }, unit: { select: { unitNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.feedback.findMany({
      where: { landlordId: ownerLandlordId },
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.message.findMany({
      where: { tenant: { unit: scope } },
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const vacantUnits = totalUnits - occupiedUnits;

  const stats = [
    { label: "Total Units", value: totalUnits, icon: Building2, color: "bg-blue-50 text-blue-700" },
    { label: "Occupied", value: occupiedUnits, icon: Users, color: "bg-green-50 text-green-700" },
    { label: "Vacant", value: vacantUnits, icon: DoorOpen, color: "bg-amber-50 text-amber-700" },
    { label: "Open Tickets", value: openTickets, icon: Wrench, color: "bg-red-50 text-red-700" },
    { label: "Open Feedback", value: openFeedback, icon: Lightbulb, color: "bg-purple-50 text-purple-700" },
  ];

  const statusColors = {
    open: "bg-red-50 text-red-700",
    "in-progress": "bg-amber-50 text-amber-700",
    closed: "bg-green-50 text-green-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Recent Tickets
            </h2>
            <Link href="/admin/tickets" className="text-xs text-[#1e3a5f] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentTickets.map((t) => (
              <Link key={t.id} href={`/admin/tickets/${t.id}`} className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{t.category}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || "bg-gray-50 text-gray-600"}`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.tenant?.name} · Unit {t.unit?.unitNumber}</p>
              </Link>
            ))}
            {recentTickets.length === 0 && <p className="text-sm text-gray-400">No tickets yet</p>}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Recent Feedback
            </h2>
            <Link href="/admin/feedback" className="text-xs text-[#1e3a5f] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentFeedback.map((f) => (
              <div key={f.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    f.type === "complaint" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}>{f.type}</span>
                  <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{f.body}</p>
                <p className="text-xs text-gray-400 mt-1">{f.anonymous ? "Anonymous" : f.tenant?.name || "Unknown"}</p>
              </div>
            ))}
            {recentFeedback.length === 0 && <p className="text-sm text-gray-400">No feedback yet</p>}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Recent Messages
            </h2>
            <Link href="/admin/messages" className="text-xs text-[#1e3a5f] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentMessages.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{m.tenant?.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.direction === "outbound" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>{m.direction}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.body}</p>
              </div>
            ))}
            {recentMessages.length === 0 && <p className="text-sm text-gray-400">No messages yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
