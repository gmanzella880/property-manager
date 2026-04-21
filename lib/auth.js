import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

export async function verifySession() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  if (!isAuthenticated || !claims) return null;
  return claims;
}

export async function getLandlordId() {
  const { requireLandlord } = await import("@/lib/landlord");
  const landlord = await requireLandlord();
  return landlord?.id || null;
}
