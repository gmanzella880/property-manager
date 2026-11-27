import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { NextResponse } from "next/server";
import { deleteProperties } from "@/lib/delete-property";

async function verifySuperAdmin() {
  const landlord = await requireLandlord();
  if (landlord.role !== "super_admin") return null;
  return landlord;
}

export async function PATCH(request, { params }) {
  const admin = await verifySuperAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, address } = await request.json();

  const data = {};
  if (name !== undefined) data.name = name;
  if (address !== undefined) data.address = address;

  const property = await prisma.property.update({ where: { id }, data });
  return NextResponse.json(property);
}

export async function DELETE(request, { params }) {
  const admin = await verifySuperAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await deleteProperties([id]); // with its units, tenants and their records
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
