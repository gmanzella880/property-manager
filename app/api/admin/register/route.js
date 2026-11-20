import { redirect } from "next/navigation";

// Legacy endpoint: sign-up is handled by Clerk
export async function GET() { redirect("/sign-up"); }
export async function POST() { redirect("/sign-up"); }
