import { signIn } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

// Legacy endpoint — redirects to Logto sign-in
export async function POST() {
  await signIn(logtoConfig);
}

export async function GET() {
  await signIn(logtoConfig);
}
