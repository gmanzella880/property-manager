import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Wrench, FileText, DollarSign } from "lucide-react";
import UnitDetail from "./unit-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const unit = await prisma.unit.findUnique({ where: { id }, select: { unitNumber: true } });
  return { title: unit ? `Unit ${unit.unitNumber} — PropertyBase` : "Unit Not Found" };
}

export default async function UnitDetailPage({ params }) {
  const { id } = await params;
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: true,
      tickets: {
        include: { tenant: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      expenses: {
        include: { vendor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!unit) notFound();

  return (
    <div>
      <Link href="/admin/units" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Units
      </Link>

      <UnitDetail unit={JSON.parse(JSON.stringify(unit))} />
    </div>
  );
}
