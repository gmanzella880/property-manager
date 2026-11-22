import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TenantProfile from "./tenant-profile";
import RentPanel from "./rent-panel";
import { monthStatus, rentRecord, periodOf } from "@/lib/rent";
import { requireLandlord, unitWhere, getSelectedPropertyId } from "@/lib/landlord";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { name: true } });
  return { title: tenant ? `${tenant.name} — PropertyBase` : "Tenant Not Found" };
}

export default async function TenantDetailPage({ params }) {
  const landlord = await requireLandlord();
  const propertyId = await getSelectedPropertyId(landlord);
  const { id } = await params;
  const tenant = await prisma.tenant.findFirst({
    where: { id, unit: unitWhere(propertyId) },
    include: {
      unit: { include: { property: true } },
      tickets: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      feedback: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }] },
    },
  });

  if (!tenant) notFound();
  const rentCents = (tenant.unit?.rentAmount || 0) * 100;

  return (
    <div>
      <Link href="/admin/tenants" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Tenants
      </Link>

      <TenantProfile tenant={JSON.parse(JSON.stringify(tenant))}>
        <RentPanel
        tenant={{ id: tenant.id, name: tenant.name }}
        current={monthStatus(rentCents, tenant.payments, periodOf())}
        record={rentRecord(tenant, rentCents, tenant.payments)}
        payments={JSON.parse(JSON.stringify(tenant.payments))}
        canRecord={tenant.active !== false}
        />
      </TenantProfile>
    </div>
  );
}
