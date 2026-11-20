import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";

export async function PUT(request, { params }) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const { id } = await params;
  const body = await request.json();

  const feedback = await prisma.feedback.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(feedback);
}

export async function DELETE(request, { params }) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const { id } = await params;
  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
