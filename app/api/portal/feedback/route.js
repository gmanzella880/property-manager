import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const { tenantId, type, body: feedbackBody, anonymous } = body;

  if (!type || !feedbackBody) {
    return NextResponse.json({ error: "Type and body are required" }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      tenantId: anonymous ? null : tenantId,
      type,
      body: feedbackBody,
      anonymous: !!anonymous,
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}
