import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  const body = await request.json();
  const { name, address, landlordName, landlordEmail } = body;

  let property = await prisma.property.findFirst({
    include: { landlord: true },
  });

  if (property) {
    await prisma.property.update({
      where: { id: property.id },
      data: { name, address },
    });

    if (property.landlord) {
      await prisma.landlord.update({
        where: { id: property.landlord.id },
        data: { name: landlordName, email: landlordEmail },
      });
    }
  }

  return NextResponse.json({ success: true });
}
