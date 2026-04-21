import { signOut } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

export async function POST() {
  await signOut(logtoConfig);
}
