import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requirePortalAccess } from "@/lib/tenant";
import TenantPortal from "./tenant-portal";
import PortalRent from "./portal-rent";
import { monthStatus, periodOf, addMonths, dateOnlyPeriod } from "@/lib/rent";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tenant Portal" };

export default async function PortalPage({ params, searchParams }) {
  const { slug } = await params;
  const { tenantId, preview } = await requirePortalAccess(slug);
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      unit: { include: { property: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
      payments: {
        where: { status: { not: "voided" } },
        orderBy: { paidAt: "desc" },
        select: { id: true, period: true, amountCents: true, method: true, status: true, paidAt: true },
      },
    },
  });

  if (!tenant) notFound();

  // Rent shown to the tenant: anything still owed from the last 3 months, this
  // month, and next month once this month is settled (so they can pay ahead)
  const rentCents = tenant.unit.rentAmount * 100;
  const now = periodOf();
  const leaseStart = dateOnlyPeriod(tenant.leaseStart);
  const months = [-3, -2, -1]
    .map((n) => addMonths(now, n))
    .filter((p) => p >= leaseStart)
    .map((p) => monthStatus(rentCents, tenant.payments, p))
    .filter((m) => m.balance > 0);
  const current = monthStatus(rentCents, tenant.payments, now);
  months.push(current);
  if (current.balance === 0) months.push(monthStatus(rentCents, tenant.payments, addMonths(now, 1)));

  const { paid } = await searchParams;
  return (
    <TenantPortal tenant={JSON.parse(JSON.stringify(tenant))} preview={preview}>
      <PortalRent
        months={months}
        payments={JSON.parse(JSON.stringify(tenant.payments))}
        online={!!process.env.STRIPE_SECRET_KEY}
        preview={preview}
        justPaid={paid === "1"}
      />
    </TenantPortal>
  );
}
