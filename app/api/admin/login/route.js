import { redirect } from "next/navigation";

// Legacy endpoint: sign-in is handled by Clerk
export async function GET() { redirect("/sign-in"); }
export async function POST() { redirect("/sign-in"); }
