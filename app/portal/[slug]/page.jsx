import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requirePortalAccess } from "@/lib/tenant";
import TenantPortal from "./tenant-portal";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tenant Portal" };

export default async function PortalPage({ params }) {
  const { slug } = await params;
  const { tenantId, preview } = await requirePortalAccess(slug);
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      unit: { include: { property: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!tenant) notFound();

  return <TenantPortal tenant={JSON.parse(JSON.stringify(tenant))} preview={preview} />;
}
