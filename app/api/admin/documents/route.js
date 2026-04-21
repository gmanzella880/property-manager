import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const documents = await prisma.document.findMany({
    include: {
      tenant: { select: { name: true } },
      unit: { select: { unitNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(request) {
  const body = await request.json();
  const { fileName, fileUrl, type, tenantId, unitId, ticketId, applicantId, expiryDate, uploadedBy } = body;

  if (!fileName || !fileUrl || !type) {
    return NextResponse.json({ error: "fileName, fileUrl, and type are required" }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      fileName,
      fileUrl,
      type,
      tenantId: tenantId || null,
      unitId: unitId || null,
      ticketId: ticketId || null,
      applicantId: applicantId || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      uploadedBy: uploadedBy || "admin",
    },
  });

  return NextResponse.json(document, { status: 201 });
}
