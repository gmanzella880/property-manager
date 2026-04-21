import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except login and register)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/register")
  ) {
    // Check for Logto session cookie (encrypted cookie set by @logto/next)
    // Cookie name follows pattern: logto_<appId>
    const appId = process.env.LOGTO_APP_ID || "m7wf0986y3l2t7uqscly0";
    const logtoSession = request.cookies.get(`logto_${appId}`)?.value;

    if (!logtoSession) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
