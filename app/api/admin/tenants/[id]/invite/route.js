import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";
import { inviteTenant } from "@/lib/invite";

// Sends (or re-sends) the tenant a portal invitation email
export async function POST(request, { params }) {
  await requireLandlord();
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { email: true, active: true } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  if (!tenant.active) return NextResponse.json({ error: "This tenant is no longer active" }, { status: 400 });
  return NextResponse.json({ invite: await inviteTenant(tenant.email, request) });
}
