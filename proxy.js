import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Admin and tenant portal pages and APIs need a signed-in user.
// (Who may see what is checked in lib/landlord.js and lib/tenant.js.)
// Signed-out page visits are sent to /sign-in; signed-out API calls get a 404.
const isProtected = createRouteMatcher(["/admin(.*)", "/api/admin(.*)", "/portal(.*)", "/api/portal(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtected(req)) await auth.protect();
  },
  // Use this site's own sign-in pages rather than Clerk's hosted ones
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" }
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
