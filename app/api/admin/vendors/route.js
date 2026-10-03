import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";

export async function GET() {
  const admin = await requireLandlord();

  const vendors = await prisma.vendor.findMany({
    where: admin.role === "super_admin" ? {} : { landlordId: admin.id },
    include: {
      _count: { select: { tickets: true, expenses: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(request) {
  const admin = await requireLandlord();
  const body = await request.json();
  const { name, phone, email, specialty } = body;

  if (!name || !phone || !specialty) {
    return NextResponse.json({ error: "Name, phone, and specialty are required" }, { status: 400 });
  }

  const vendor = await prisma.vendor.create({
    data: { name, phone, email: email || null, specialty, landlordId: admin.id },
  });

  return NextResponse.json(vendor, { status: 201 });
}
