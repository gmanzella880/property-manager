import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TenantPortal from "./tenant-portal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { name: true } });
  return { title: tenant ? `${tenant.name} — Tenant Portal` : "Portal Not Found" };
}

export default async function PortalPage({ params }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      unit: { include: { property: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!tenant) notFound();

  return <TenantPortal tenant={JSON.parse(JSON.stringify(tenant))} />;
}
