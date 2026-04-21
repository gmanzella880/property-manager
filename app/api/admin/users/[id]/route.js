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

  try {
    // Delete in order to satisfy foreign key constraints
    // 1. Delete all nested data under the user's properties
    const properties = await prisma.property.findMany({ where: { landlordId: id }, select: { id: true } });
    const propertyIds = properties.map((p) => p.id);
    
    if (propertyIds.length > 0) {
      const units = await prisma.unit.findMany({ where: { propertyId: { in: propertyIds } }, select: { id: true } });
      const unitIds = units.map((u) => u.id);

      if (unitIds.length > 0) {
        // Delete tenant-related data
        await prisma.message.deleteMany({ where: { tenant: { unitId: { in: unitIds } } } });
        await prisma.ticket.deleteMany({ where: { unitId: { in: unitIds } } });
        await prisma.document.deleteMany({ where: { unitId: { in: unitIds } } });
        await prisma.expense.deleteMany({ where: { unitId: { in: unitIds } } });
        await prisma.tenant.deleteMany({ where: { unitId: { in: unitIds } } });
      }

      await prisma.unit.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.property.deleteMany({ where: { landlordId: id } });
    }

    // 2. Delete user-level data
    await prisma.vendor.deleteMany({ where: { landlordId: id } });
    await prisma.feedback.deleteMany({ where: { landlordId: id } });
    await prisma.vacancy.deleteMany({ where: { landlordId: id } });

    // 3. Delete the user
    await prisma.landlord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
