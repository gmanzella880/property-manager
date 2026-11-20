import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const { userId } = await auth();
  redirect(userId ? "/admin" : "/sign-in");
}
