import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { MANUAL_METHODS, isPeriod, toCents, landlordManages } from "@/lib/rent";

// Record a payment made outside Stripe (cash, check, money order, other)
export async function POST(request) {
  const landlord = await requireLandlord();
  const body = await request.json().catch(() => ({}));
  const { tenantId, period, method } = body;
  const note = String(body.note ?? "")
    .trim()
    .slice(0, 200);
  const amountCents = toCents(body.amount);
  const paidAt = body.paidAt ? new Date(`${body.paidAt}T12:00:00`) : new Date();

  if (!tenantId || !isPeriod(period))
    return NextResponse.json(
      { error: "Choose the tenant and the month this payment is for." },
      { status: 400 },
    );
  if (!amountCents)
    return NextResponse.json(
      { error: "Enter the amount paid." },
      { status: 400 },
    );
  if (!MANUAL_METHODS.includes(method))
    return NextResponse.json(
      { error: "Choose how they paid." },
      { status: 400 },
    );
  if (method === "other" && !note)
    return NextResponse.json(
      { error: 'For "Other", write in how they paid.' },
      { status: 400 },
    );
  if (
    Number.isNaN(paidAt.getTime()) ||
    paidAt > new Date(Date.now() + 86400000)
  )
    return NextResponse.json(
      { error: "Enter a valid payment date." },
      { status: 400 },
    );

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { unit: { include: { property: true } } },
  });
  if (!tenant || !landlordManages(landlord, tenant))
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const payment = await prisma.rentPayment.create({
    data: {
      tenantId,
      unitId: tenant.unitId,
      period,
      amountCents,
      method,
      note,
      paidAt,
      status: "succeeded",
      source: "manual",
      recordedBy: landlord.name,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
