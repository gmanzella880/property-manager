import { redirect } from "next/navigation";
import { requirePortalAccess } from "@/lib/tenant";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Where the website's "Sign in to Tenant Portal" link lands
export default async function PortalHome() {
  const { tenantId } = await requirePortalAccess(null);
  const { slug } = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
  redirect(`/portal/${slug}`);
}
