import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logtoConfig } from "../logto";

// Counts consecutive failed callbacks so a broken config surfaces as a readable
// page instead of bouncing /callback -> /sign-in -> Logto -> /callback forever.
const RETRY_COOKIE = "logto_signin_retry";
const MAX_RETRIES = 1;

function sessionCookieName() {
  return logtoConfig.appId ? `logto_${logtoConfig.appId}` : null;
}

/**
 * Drops the encrypted session cookie. A cookie written under a previous
 * LOGTO_COOKIE_SECRET still decrypts to an empty session rather than throwing,
 * so it looks "present" to the proxy while carrying no identity — clearing it
 * is what lets the next attempt start clean.
 */
function clearSession(response) {
  const name = sessionCookieName();
  if (name) {
    response.cookies.delete(name);
  }
  return response;
}

function errorPage(message, retryHref) {
  const safe = String(message ?? "Unknown error").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-in failed</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center;
         font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;
         background:#f6f7f9; color:#111827; padding:24px; }
  @media (prefers-color-scheme: dark) { body { background:#0b0d12; color:#e5e7eb; } .card { background:#151822; border-color:#252a37; } code { background:#0b0d12; } }
  .card { max-width:520px; width:100%; background:#fff; border:1px solid #e5e7eb;
          border-radius:12px; padding:28px; }
  h1 { margin:0 0 8px; font-size:20px; }
  p { margin:0 0 16px; color:#6b7280; }
  code { display:block; padding:12px; border-radius:8px; background:#f3f4f6;
         font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
         white-space:pre-wrap; word-break:break-word; margin-bottom:20px; }
  a { display:inline-block; background:#6139F6; color:#fff; text-decoration:none;
      padding:10px 18px; border-radius:8px; font-weight:600; }
</style></head>
<body><div class="card">
  <h1>Sign-in failed</h1>
  <p>Logto rejected the sign-in. The underlying error was:</p>
  <code>${safe}</code>
  <a href="${retryHref}">Try again</a>
</div></body></html>`;
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const signInUrl = new URL("/sign-in", request.url);

  const retries = Number(request.cookies.get(RETRY_COOKIE)?.value ?? "0") || 0;

  const fail = (message) => {
    // Out of retries: stop bouncing and show what actually went wrong.
    if (retries >= MAX_RETRIES) {
      const response = new NextResponse(errorPage(message, signInUrl.pathname), {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      response.cookies.delete(RETRY_COOKIE);
      return clearSession(response);
    }

    // First failure is usually a stale or replayed callback — clear it and
    // send the user back through a fresh authorize request.
    const response = NextResponse.redirect(signInUrl);
    response.cookies.set(RETRY_COOKIE, String(retries + 1), {
      httpOnly: true,
      sameSite: "lax",
      secure: logtoConfig.cookieSecure,
      path: "/",
      maxAge: 300,
    });
    return clearSession(response);
  };

  // Logto reports consent denial and similar OAuth failures as query params
  // rather than by throwing, so handleSignIn would never see them.
  const oidcError = searchParams.get("error");
  if (oidcError) {
    return fail(`${oidcError}: ${searchParams.get("error_description") ?? "no description"}`);
  }

  try {
    await handleSignIn(logtoConfig, searchParams);
  } catch (error) {
    // redirect() signals via a thrown NEXT_REDIRECT — never swallow it.
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Logto handleSignIn failed:", error);
    return fail(error?.message ?? String(error));
  }

  // Signed in: drop the retry counter so the next failure gets a fresh budget.
  (await cookies()).delete(RETRY_COOKIE);

  redirect("/admin");
}
