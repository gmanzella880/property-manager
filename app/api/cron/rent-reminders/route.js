import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilioClient from "@/lib/twilio";
import { shouldSendReminder, reminderMessage } from "@/lib/dates";
import { monthStatus, periodOf, addMonths } from "@/lib/rent";

export async function GET(request) {
  // Fail closed. The old `process.env.CRON_SECRET && ...` guard silently left the
  // endpoint open to anyone when the variable was unset — and this endpoint sends
  // SMS to every tenant, so an open version costs real money.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not set; refusing to run rent reminders.");
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const { send, type } = shouldSendReminder(now);

  if (!send) {
    return NextResponse.json({ message: "No reminders to send today", type: null });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const configured = [accountSid, authToken, from].filter(Boolean).length;

  // .env.example documents blank Twilio vars as "leave blank to run without SMS",
  // so an entirely blank set is a supported setup and must not fail the cron job.
  // A partially filled set is a genuine misconfiguration and still errors.
  if (configured === 0) {
    return NextResponse.json({ message: "SMS disabled - Twilio not configured", type, sent: 0 });
  }
  if (configured < 3) {
    return NextResponse.json(
      { error: "Twilio is partially configured; set all three TWILIO_* variables or none" },
      { status: 500 }
    );
  }

  // The month being reminded about: the coming 1st, or this month on/after the 1st
  const period = type === "due_10days" || type === "due_2days" ? addMonths(periodOf(now), 1) : periodOf(now);

  const all = await prisma.tenant.findMany({
    where: { active: true },
    select: {
      id: true, name: true, phone: true,
      unit: { select: { rentAmount: true } },
      payments: { where: { period }, select: { period: true, amountCents: true, status: true } },
    },
  });
  // Skip tenants who have paid (or whose bank payment is clearing)
  const tenants = all.filter((t) => monthStatus(t.unit.rentAmount * 100, t.payments, period).balance > 0);

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

  return NextResponse.json({ type, period, sent, failed, total: tenants.length, skippedPaid: all.length - tenants.length });
}
