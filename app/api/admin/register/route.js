import { signIn } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";

// Registration is handled by Logto — redirect to sign-up
export async function POST() {
  await signIn(logtoConfig);
}

export async function GET() {
  await signIn(logtoConfig);
}
