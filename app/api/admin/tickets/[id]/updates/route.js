import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { message, from } = body;

  if (!message || !from) {
    return NextResponse.json({ error: "Message and from are required" }, { status: 400 });
  }

  const update = await prisma.ticketUpdate.create({
    data: { ticketId: id, message, from },
  });

  return NextResponse.json(update, { status: 201 });
}
