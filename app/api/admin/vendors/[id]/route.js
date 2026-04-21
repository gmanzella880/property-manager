import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      tickets: {
        include: { unit: { select: { unitNumber: true } } },
        orderBy: { createdAt: "desc" },
      },
      expenses: {
        include: { unit: { select: { unitNumber: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }
  return NextResponse.json(vendor);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email || null;
  if (body.specialty !== undefined) data.specialty = body.specialty;

  const vendor = await prisma.vendor.update({
    where: { id },
    data,
  });

  return NextResponse.json(vendor);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
