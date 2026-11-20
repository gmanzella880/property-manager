import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireLandlord } from "@/lib/landlord";

export async function POST(request) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const body = await request.json();
  const { vacancyId, name, email, phone } = body;

  if (!vacancyId || !name || !email || !phone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const applicant = await prisma.applicant.create({
    data: { vacancyId, name, email, phone },
  });

  return NextResponse.json(applicant, { status: 201 });
}

export async function PUT(request) {
  await requireLandlord(); // landlords only (tenants and signed-out users are redirected)
  const body = await request.json();
  const { applicantId, status } = body;

  if (!applicantId || !status) {
    return NextResponse.json({ error: "applicantId and status are required" }, { status: 400 });
  }

  const applicant = await prisma.applicant.update({
    where: { id: applicantId },
    data: { status },
  });

  return NextResponse.json(applicant);
}
