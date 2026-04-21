import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { NextResponse } from "next/server";

export async function POST(request) {
  const admin = await requireLandlord();
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, address, landlordId } = await request.json();

  if (!name || !landlordId) {
    return NextResponse.json({ error: "Name and landlordId are required" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      name,
      address: address || "",
      landlordId,
    },
  });

  return NextResponse.json(property, { status: 201 });
}
