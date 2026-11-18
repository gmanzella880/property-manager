import LogtoClient from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import { NextResponse } from "next/server";

export async function GET() {
  const client = new LogtoClient(logtoConfig);

  try {
    const url = await client.handleSignOut(logtoConfig.baseUrl);
    return NextResponse.redirect(url);
  } catch (error) {
    // handleSignOut() destroys the session cookie only *after* nodeClient.signOut()
    // succeeds, and signOut() throws when there is no readable id token — exactly
    // the case where the cookie is corrupt and most needs clearing. Without this,
    // a bad cookie can never be cleared from inside the app.
    console.error("Logto sign-out failed, clearing session cookie directly:", error);

    const response = NextResponse.redirect(new URL("/sign-in", logtoConfig.baseUrl));
    if (logtoConfig.appId) {
      response.cookies.delete(`logto_${logtoConfig.appId}`);
    }
    return response;
  }
}
