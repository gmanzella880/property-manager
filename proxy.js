import { NextResponse } from "next/server";

// Set at request time: `proxy` runs on the Node.js runtime (the Edge runtime is
// not supported here in Next 16), so this is the real container env, not a value
// inlined at build time. The Docker build receives no secrets, which is why the
// old edge middleware needed a hardcoded app-id fallback.
const APP_ID = process.env.LOGTO_APP_ID;

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // These two render their own redirect into the Logto flow.
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/register")) {
    return NextResponse.next();
  }

  // Optimistic check only — does an encrypted Logto session cookie exist at all.
  // It is never decrypted here. requireLandlord() does the authoritative check on
  // every /admin page and redirects to /sign-in when the session is absent,
  // expired, or undecryptable.
  //
  // Fails open when APP_ID is missing: guessing the wrong cookie name would
  // redirect every request to /sign-in, and /callback would land back on /admin
  // into an endless bounce. requireLandlord() still blocks the request.
  if (!APP_ID) {
    return NextResponse.next();
  }

  if (!request.cookies.get(`logto_${APP_ID}`)?.value) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
