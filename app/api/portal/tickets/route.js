import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const { tenantId, unitId, category, description, priority } = body;

  if (!tenantId || !unitId || !category || !description || !priority) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: { tenantId, unitId, category, description, priority },
  });

  return NextResponse.json(ticket, { status: 201 });
}
