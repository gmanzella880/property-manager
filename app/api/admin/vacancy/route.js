import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";

export async function GET() {
  const admin = await requireLandlord();
  const propertyFilter = admin.role === "super_admin" ? {} : { property: { landlordId: admin.id } };

  const units = await prisma.unit.findMany({
    where: propertyFilter,
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { name: true } },
    },
    orderBy: { unitNumber: "asc" },
  });

  const vacancies = await prisma.vacancy.findMany({
    where: admin.role === "super_admin" ? {} : { landlordId: admin.id },
    include: {
      applicants: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ units, vacancies });
}

export async function POST(request) {
  const admin = await requireLandlord();
  const body = await request.json();
  const { unitId } = body;

  if (!unitId) {
    return NextResponse.json({ error: "unitId is required" }, { status: 400 });
  }

  const vacancy = await prisma.vacancy.create({
    data: { unitId, listedAt: new Date(), landlordId: admin.id },
  });

  return NextResponse.json(vacancy, { status: 201 });
}
