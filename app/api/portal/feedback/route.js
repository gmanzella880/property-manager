import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const { tenantId, type, body: feedbackBody, anonymous } = body;

  if (!type || !feedbackBody || !tenantId) {
    return NextResponse.json({ error: "Type and body are required" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { unit: { select: { property: { select: { landlordId: true } } } } },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      landlordId: tenant.unit.property.landlordId,
      tenantId: anonymous ? null : tenantId,
      type,
      body: feedbackBody,
      anonymous: !!anonymous,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
