import { requireLandlord } from "@/lib/landlord";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  await requireLandlord();
  const { propertyId } = await request.json();

  const cookieStore = await cookies();
  cookieStore.set("selectedPropertyId", propertyId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ success: true });
}
