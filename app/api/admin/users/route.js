import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { NextResponse } from "next/server";

export async function POST(request) {
  const admin = await requireLandlord();
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, phone, role } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (role && !["super_admin", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await prisma.landlord.create({
    data: {
      authId: `manual_${Date.now()}`,
      name,
      email,
      phone: phone || "",
      role: role || "admin",
    },
  });

  return NextResponse.json(user);
}
