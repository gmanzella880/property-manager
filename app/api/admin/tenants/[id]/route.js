import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      tickets: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      feedback: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  return NextResponse.json(tenant);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.phone) data.phone = body.phone;
  if (body.leaseStart) data.leaseStart = new Date(body.leaseStart);
  if (body.leaseEnd) data.leaseEnd = new Date(body.leaseEnd);
  if (body.active !== undefined) data.active = body.active;

  const tenant = await prisma.tenant.update({
    where: { id },
    data,
    include: { unit: true },
  });

  return NextResponse.json(tenant);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.tenant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
