import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilioClient from "@/lib/twilio";

export async function GET(request, { params }) {
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

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(ticket);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.status) data.status = body.status;
  if (body.priority) data.priority = body.priority;
  if (body.vendorId !== undefined) data.vendorId = body.vendorId || null;

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
    include: { tenant: { select: { name: true, phone: true } } },
  });

  // Send SMS on status change
  if (body.status && ticket.tenant?.phone && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const msg = `Hi ${ticket.tenant.name}, your maintenance ticket has been updated to: ${body.status}. — Georgian Oaks Apartments`;
      await twilioClient.messages.create({
        body: msg,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: ticket.tenant.phone,
      });

      // Log the message
      await prisma.message.create({
        data: {
          tenantId: ticket.tenantId,
          body: msg,
          direction: "outbound",
        },
      });
    } catch (e) {
      console.error("Failed to send SMS:", e.message);
    }
  }

  return NextResponse.json(ticket);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
