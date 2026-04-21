import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  // Twilio sends form-encoded data
  const formData = await request.formData();
  const from = formData.get("From");
  const body = formData.get("Body");

  if (!from || !body) {
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Normalize phone number (strip +1 prefix if present for matching)
  const normalizedPhone = from.replace(/^\+1/, "").replace(/\D/g, "");

  // Find tenant by phone
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { phone: from },
        { phone: normalizedPhone },
        { phone: `+1${normalizedPhone}` },
        { phone: normalizedPhone.slice(-10) },
      ],
    },
  });

  if (tenant) {
    await prisma.message.create({
      data: {
        tenantId: tenant.id,
        body,
        direction: "inbound",
      },
    });
  }

  // Return empty TwiML response
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}
