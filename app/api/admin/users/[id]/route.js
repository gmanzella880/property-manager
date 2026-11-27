import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { NextResponse } from "next/server";
import { deleteProperties } from "@/lib/delete-property";

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
    // 1. Delete the user's properties and everything under them
    const properties = await prisma.property.findMany({ where: { landlordId: id }, select: { id: true } });
    await deleteProperties(properties.map((p) => p.id));

    // 2. Delete user-level data (unlinking or removing rows that point at it first)
    const vendorIds = (await prisma.vendor.findMany({ where: { landlordId: id }, select: { id: true } })).map((v) => v.id);
    await prisma.ticket.updateMany({ where: { vendorId: { in: vendorIds } }, data: { vendorId: null } });
    await prisma.expense.updateMany({ where: { vendorId: { in: vendorIds } }, data: { vendorId: null } });
    const applicantIds = (await prisma.applicant.findMany({ where: { vacancy: { landlordId: id } }, select: { id: true } })).map((a) => a.id);
    await prisma.document.deleteMany({ where: { applicantId: { in: applicantIds } } });
    await prisma.applicant.deleteMany({ where: { id: { in: applicantIds } } });
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
