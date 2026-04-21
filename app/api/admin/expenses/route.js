import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: {
      unit: { select: { unitNumber: true } },
      vendor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request) {
  const body = await request.json();
  const { description, amount, unitId, vendorId, receiptUrl } = body;

  if (!description || amount == null || !unitId) {
    return NextResponse.json({ error: "description, amount, and unitId are required" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: parseInt(amount),
      unitId,
      vendorId: vendorId || null,
      receiptUrl: receiptUrl || null,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
