import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantForRequest } from "@/lib/tenant";

export async function POST(request) {
  const tenant = await tenantForRequest();
  if (!tenant) return NextResponse.json({ error: "Only the tenant can submit from this portal" }, { status: 403 });
  const { id: tenantId, unitId } = tenant;
  const body = await request.json();
  const { category, description, priority } = body;

  if (!category || !description || !priority) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: { tenantId, unitId, category, description, priority },
  });

  return NextResponse.json(ticket, { status: 201 });
}
