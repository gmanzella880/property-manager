import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TicketDetail from "./ticket-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id }, select: { category: true } });
  return { title: ticket ? `${ticket.category} Ticket — PropertyBase` : "Ticket Not Found" };
}

export default async function TicketDetailPage({ params }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      tenant: { select: { id: true, name: true, phone: true } },
      unit: { select: { unitNumber: true } },
      vendor: true,
      updates: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!ticket) notFound();

  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      <TicketDetail
        ticket={JSON.parse(JSON.stringify(ticket))}
        vendors={JSON.parse(JSON.stringify(vendors))}
      />
    </div>
  );
}
