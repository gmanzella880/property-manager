import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Stripe calls this when an online payment completes, clears or fails.
// Bank (ACH) payments take a few days: they're recorded as "pending" first.
export async function POST(request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret)
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature"),
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const status = {
    "checkout.session.completed": (s) =>
      s.payment_status === "paid" ? "succeeded" : "pending",
    "checkout.session.async_payment_succeeded": () => "succeeded",
    "checkout.session.async_payment_failed": () => "failed",
  }[event.type];
  if (!status) return NextResponse.json({ received: true });

  const session = event.data.object;
  const { tenantId, unitId, period } = session.metadata || {};
  if (!tenantId || !unitId || !period || session.mode !== "payment")
    return NextResponse.json({ received: true });

  // Bank (ACH) payments are the only ones that clear later ("async");
  // a card payment is already paid when checkout completes.
  const async =
    event.type !== "checkout.session.completed" ||
    session.payment_status !== "paid";
  const method = async ? "ach" : "card";
  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const data = {
    status: status(session),
    method,
    stripePaymentIntentId: piId || null,
  };
  // Events can arrive out of order: never move a cleared or failed payment back to pending
  const existing = await prisma.rentPayment.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing && existing.status !== "pending" && data.status === "pending")
    return NextResponse.json({ received: true });

  await prisma.rentPayment.upsert({
    where: { stripeSessionId: session.id },
    update: data,
    create: {
      ...data,
      tenantId,
      unitId,
      period,
      amountCents: session.amount_total,
      paidAt: new Date(session.created * 1000),
      source: "stripe",
      stripeSessionId: session.id,
      note:
        method === "ach"
          ? "Paid online by bank account"
          : "Paid online by card",
    },
  });
  return NextResponse.json({ received: true });
}
