import LogtoClient from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import { NextResponse } from "next/server";

export async function GET() {
  const client = new LogtoClient(logtoConfig);

  try {
    const url = await client.handleSignOut(logtoConfig.baseUrl);
    return NextResponse.redirect(url);
  } catch {
    // If sign-out fails (e.g. no session), just redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", logtoConfig.baseUrl));
  }
}
