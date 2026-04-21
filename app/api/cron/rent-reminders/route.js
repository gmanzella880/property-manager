import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilioClient from "@/lib/twilio";
import { shouldSendReminder, reminderMessage } from "@/lib/dates";

export async function GET(request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const { send, type } = shouldSendReminder(now);

  if (!send) {
    return NextResponse.json({ message: "No reminders to send today", type: null });
  }

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, phone: true },
  });

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    return NextResponse.json({ error: "Twilio not configured" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const tenant of tenants) {
    const body = reminderMessage(type, tenant.name);
    if (!body) continue;

    try {
      await twilioClient.messages.create({
        body,
        from,
        to: tenant.phone,
      });

      await prisma.message.create({
        data: {
          tenantId: tenant.id,
          body,
          direction: "outbound",
        },
      });

      sent++;
    } catch (e) {
      console.error(`Failed to send to ${tenant.name}:`, e.message);
      failed++;
    }
  }

  return NextResponse.json({ type, sent, failed, total: tenants.length });
}
