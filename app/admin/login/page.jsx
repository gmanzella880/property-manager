import { redirect } from "next/navigation";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "../../logto";

export default async function AdminLoginPage() {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);

  if (isAuthenticated) {
    redirect("/admin");
  }

  // Not authenticated — redirect to Logto sign-in
  redirect("/sign-in");
}
