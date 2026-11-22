import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantForRequest } from "@/lib/tenant";
import { getStripe } from "@/lib/stripe";
import {
  addMonths,
  isPeriod,
  monthStatus,
  periodLabel,
  periodOf,
} from "@/lib/rent";

// Starts a Stripe Checkout payment for the signed-in tenant's rent
export async function POST(request) {
  const stripe = getStripe();
  if (!stripe)
    return NextResponse.json(
      {
        error:
          "Online payments aren't set up yet. Please pay your landlord directly.",
      },
      { status: 503 },
    );

  const tenant = await tenantForRequest();
  if (!tenant)
    return NextResponse.json(
      { error: "Only the tenant can pay from this portal" },
      { status: 403 },
    );

  const { period } = await request.json().catch(() => ({}));
  const current = periodOf();
  // A tenant may pay the current month (or an earlier unpaid one) or next month in advance
  if (!isPeriod(period) || period > addMonths(current, 1))
    return NextResponse.json(
      { error: "Choose a valid month" },
      { status: 400 },
    );

  const unit = await prisma.unit.findUnique({
    where: { id: tenant.unitId },
    include: { property: true },
  });
  const payments = await prisma.rentPayment.findMany({
    where: { tenantId: tenant.id, period },
  });
  const { balance } = monthStatus(unit.rentAmount * 100, payments, period);
  if (balance <= 0)
    return NextResponse.json(
      { error: `${periodLabel(period)} is already paid.` },
      { status: 400 },
    );

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["us_bank_account", "card"],
      customer_email: tenant.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: balance,
            product_data: {
              name: `Rent for ${periodLabel(period)}`,
              description: `${unit.property.name}, Unit ${unit.unitNumber}`,
            },
          },
        },
      ],
      metadata: { tenantId: tenant.id, unitId: unit.id, period },
      payment_intent_data: {
        metadata: { tenantId: tenant.id, unitId: unit.id, period },
      },
      success_url: `${origin}/portal/${tenant.slug}?paid=1`,
      cancel_url: `${origin}/portal/${tenant.slug}`,
    });
  } catch (e) {
    console.error("Stripe checkout failed:", e?.message);
    return NextResponse.json(
      {
        error:
          "Online payment is unavailable right now. Please try again later or pay your landlord directly.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ url: session.url });
}
