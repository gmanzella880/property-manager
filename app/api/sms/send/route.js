import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilioClient from "@/lib/twilio";

export async function POST(request) {
  const body = await request.json();
  const { tenantId, message, broadcast } = body;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    return NextResponse.json({ error: "Twilio not configured" }, { status: 500 });
  }

  if (broadcast) {
    // Send to all tenants
    const tenants = await prisma.tenant.findMany({ select: { id: true, phone: true, name: true } });
    const results = [];

    for (const tenant of tenants) {
      try {
        await twilioClient.messages.create({
          body: message,
          from,
          to: tenant.phone,
        });
        await prisma.message.create({
          data: { tenantId: tenant.id, body: message, direction: "outbound" },
        });
        results.push({ tenantId: tenant.id, success: true });
      } catch (e) {
        results.push({ tenantId: tenant.id, success: false, error: e.message });
      }
    }

    return NextResponse.json({ results, sent: results.filter((r) => r.success).length });
  }

  // Send to single tenant
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { phone: true } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from,
      to: tenant.phone,
    });

    const msg = await prisma.message.create({
      data: { tenantId, body: message, direction: "outbound" },
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to send SMS: " + e.message }, { status: 500 });
  }
}
