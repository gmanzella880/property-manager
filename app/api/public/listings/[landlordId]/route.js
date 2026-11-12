import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public, read-only listings feed for a landlord's marketing website.
 * No login required, so it exposes ONLY non-sensitive fields: property name
 * and address, unit counts, and the unit number and rent of VACANT units.
 * Never add tenant, lease, payment or occupied-unit details here.
 *
 * "Vacant" matches the Vacancy page: a unit with no tenant attached.
 */
export async function GET(request, { params }) {
  const { landlordId } = await params;

  const landlord = await prisma.landlord.findUnique({
    where: { id: landlordId },
    select: { id: true },
  });
  if (!landlord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const properties = await prisma.property.findMany({
    where: { landlordId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      units: {
        orderBy: { unitNumber: "asc" },
        select: {
          id: true,
          unitNumber: true,
          rentAmount: true,
          tenant: { select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      properties: properties.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        totalUnits: p.units.length,
        vacantUnits: p.units
          .filter((u) => !u.tenant)
          .map((u) => ({ id: u.id, unitNumber: u.unitNumber, rentAmount: u.rentAmount })),
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
