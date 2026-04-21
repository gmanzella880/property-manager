import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors = {
  open: "bg-red-50 text-red-700",
  "in-progress": "bg-amber-50 text-amber-700",
  closed: "bg-green-50 text-green-700",
};

export const metadata = { title: "My Tickets — Tenant Portal" };

export default async function TenantTicketsPage({ params }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      tickets: {
        include: { updates: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/portal/${slug}`} className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <h1 className="font-bold text-lg mt-2">My Tickets</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tenant.tickets.length > 0 ? (
          <div className="space-y-4">
            {tenant.tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{ticket.category}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || "bg-gray-50 text-gray-600"}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{ticket.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                  <span className="capitalize">· {ticket.priority} priority</span>
                </div>

                {ticket.updates.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Updates:</p>
                    {ticket.updates.map((u) => (
                      <div key={u.id} className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <span className="font-medium">{u.from}:</span> {u.message}
                        <span className="text-gray-400 ml-2">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No tickets submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
