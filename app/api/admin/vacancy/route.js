import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const units = await prisma.unit.findMany({
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { name: true } },
    },
    orderBy: { unitNumber: "asc" },
  });

  const vacancies = await prisma.vacancy.findMany({
    include: {
      applicants: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ units, vacancies });
}

export async function POST(request) {
  const body = await request.json();
  const { unitId } = body;

  if (!unitId) {
    return NextResponse.json({ error: "unitId is required" }, { status: 400 });
  }

  const vacancy = await prisma.vacancy.create({
    data: { unitId, listedAt: new Date() },
  });

  return NextResponse.json(vacancy, { status: 201 });
}
