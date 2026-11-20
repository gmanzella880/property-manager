"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutLink() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/sign-in?redirect_url=/portal" })}
      className="mt-6 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5280] cursor-pointer"
    >
      Sign in with a different account
    </button>
  );
}
