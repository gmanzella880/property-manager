import { clerkClient } from "@clerk/nextjs/server";

/**
 * Emails a tenant a Clerk invitation to the tenant portal.
 * Returns "sent", "has-account" (they can already sign in) or "failed".
 */
export async function inviteTenant(email, request) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "tenant" },
      redirectUrl: `${origin.replace(/\/$/, "")}/sign-up`,
      notify: true,
      ignoreExisting: true,
    });
    return "sent";
  } catch (e) {
    const code = e?.errors?.[0]?.code;
    if (code === "form_identifier_exists" || code === "duplicate_record") return "has-account";
    console.error("Tenant invitation failed:", code || e?.message);
    return "failed";
  }
}
