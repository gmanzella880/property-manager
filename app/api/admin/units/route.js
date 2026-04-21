import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord, getSelectedPropertyId } from "@/lib/landlord";

export async function GET() {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);

  const units = await prisma.unit.findMany({
    where: propertyId ? { propertyId } : {},
    include: {
      property: true,
      tenant: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { unitNumber: "asc" },
  });
  return NextResponse.json(units);
}

export async function POST(request) {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const body = await request.json();
  const { unitNumber, rentAmount } = body;

  if (!unitNumber || rentAmount == null) {
    return NextResponse.json({ error: "Unit number and rent amount are required" }, { status: 400 });
  }

  if (!propertyId) {
    return NextResponse.json({ error: "No property selected" }, { status: 400 });
  }

  const unit = await prisma.unit.create({
    data: {
      unitNumber,
      rentAmount: parseInt(rentAmount),
      propertyId,
    },
  });

  return NextResponse.json(unit, { status: 201 });
}
