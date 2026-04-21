import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { logtoConfig } from "../logto";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  try {
    await handleSignIn(logtoConfig, searchParams);
  } catch (error) {
    // redirect() throws a NEXT_REDIRECT error — rethrow it
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Logto handleSignIn error:", error);
    return new Response("Sign-in failed: " + error.message, { status: 500 });
  }
  redirect("/admin");
}
