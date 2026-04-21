import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const feedback = await prisma.feedback.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(feedback);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
