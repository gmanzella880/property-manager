import { auth } from "@clerk/nextjs/server";

export async function verifySession() {
  const { userId } = await auth();
  return userId ? { sub: userId } : null;
}

export async function getLandlordId() {
  const { requireLandlord } = await import("@/lib/landlord");
  const landlord = await requireLandlord();
  return landlord?.id || null;
}
