import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateSlug(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    include: {
      unit: { include: { property: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tenants);
}

export async function POST(request) {
  const body = await request.json();
  const { name, email, phone, unitId, leaseStart, leaseEnd, rentAmount } = body;

  if (!name || !email || !phone || !unitId || !leaseStart || !leaseEnd) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Check if unit already has a tenant
  const existing = await prisma.tenant.findUnique({ where: { unitId } });
  if (existing) {
    return NextResponse.json({ error: "This unit already has a tenant" }, { status: 400 });
  }

  // Update rent amount if provided
  if (rentAmount != null) {
    await prisma.unit.update({
      where: { id: unitId },
      data: { rentAmount: parseInt(rentAmount) },
    });
  }

  // Generate unique slug
  let slug = generateSlug(name);
  let slugExists = await prisma.tenant.findUnique({ where: { slug } });
  while (slugExists) {
    slug = generateSlug(name);
    slugExists = await prisma.tenant.findUnique({ where: { slug } });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      email,
      phone,
      unitId,
      leaseStart: new Date(leaseStart),
      leaseEnd: new Date(leaseEnd),
      slug,
    },
    include: { unit: true },
  });

  return NextResponse.json(tenant, { status: 201 });
}
