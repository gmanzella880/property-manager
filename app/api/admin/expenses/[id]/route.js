import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.description !== undefined) data.description = body.description;
  if (body.amount !== undefined) data.amount = parseInt(body.amount);
  if (body.unitId !== undefined) data.unitId = body.unitId;
  if (body.vendorId !== undefined) data.vendorId = body.vendorId || null;
  if (body.receiptUrl !== undefined) data.receiptUrl = body.receiptUrl || null;

  const expense = await prisma.expense.update({
    where: { id },
    data,
  });

  return NextResponse.json(expense);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
