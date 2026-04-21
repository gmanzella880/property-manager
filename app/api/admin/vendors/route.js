import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    include: {
      _count: { select: { tickets: true, expenses: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(request) {
  const body = await request.json();
  const { name, phone, email, specialty } = body;

  if (!name || !phone || !specialty) {
    return NextResponse.json({ error: "Name, phone, and specialty are required" }, { status: 400 });
  }

  const vendor = await prisma.vendor.create({
    data: { name, phone, email: email || null, specialty },
  });

  return NextResponse.json(vendor, { status: 201 });
}
