import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
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
