import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { landlordManages } from "@/lib/rent";

// Void a recorded payment (kept in the history, no longer counted)
export async function POST(request, { params }) {
  const landlord = await requireLandlord();
  const { id } = await params;
  const { reason } = await request.json().catch(() => ({}));
  const voidReason = String(reason ?? "")
    .trim()
    .slice(0, 200);
  if (!voidReason)
    return NextResponse.json(
      { error: "Say why this payment is being voided." },
      { status: 400 },
    );

  const payment = await prisma.rentPayment.findUnique({
    where: { id },
    include: { tenant: { include: { unit: { include: { property: true } } } } },
  });
  if (!payment || !landlordManages(landlord, payment.tenant))
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.source === "stripe") {
    return NextResponse.json(
      {
        error:
          "Online payments can't be voided here. Refund it in Stripe instead.",
      },
      { status: 400 },
    );
  }
  if (payment.status === "voided")
    return NextResponse.json({ error: "Already voided" }, { status: 400 });

  const updated = await prisma.rentPayment.update({
    where: { id },
    data: { status: "voided", voidReason, voidedBy: landlord.name },
  });
  return NextResponse.json(updated);
}
