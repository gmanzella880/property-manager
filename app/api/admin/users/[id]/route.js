import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { NextResponse } from "next/server";

async function verifySuperAdmin() {
  const landlord = await requireLandlord();
  if (landlord.role !== "super_admin") {
    return null;
  }
  return landlord;
}

export async function PATCH(request, { params }) {
  const admin = await verifySuperAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, role } = body;

  // Prevent changing your own role
  if (role && id === admin.id && role !== admin.role) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  if (role && !["super_admin", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (role !== undefined) data.role = role;

  const user = await prisma.landlord.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}

export async function DELETE(request, { params }) {
  const admin = await verifySuperAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.landlord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
