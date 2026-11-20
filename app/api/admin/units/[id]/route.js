import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { unitDetailsFrom } from "@/lib/unit-details";

export async function GET(request, { params }) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const { id } = await params;
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: true,
      tickets: { include: { tenant: true }, orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      expenses: { include: { vendor: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }
  return NextResponse.json(unit);
}

export async function PUT(request, { params }) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const { id } = await params;
  const body = await request.json();

  const unit = await prisma.unit.update({
    where: { id },
    data: {
      unitNumber: body.unitNumber,
      rentAmount: body.rentAmount != null ? parseInt(body.rentAmount) : undefined,
      ...unitDetailsFrom(body),
    },
  });

  return NextResponse.json(unit);
}

export async function DELETE(request, { params }) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const { id } = await params;
  await prisma.unit.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
