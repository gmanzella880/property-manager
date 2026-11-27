import prisma from "@/lib/prisma";

/**
 * Deletes properties together with their units, tenants and everything that
 * points at them, in one transaction so a failure leaves nothing half-deleted.
 * Order matters: rows are removed before the rows their foreign keys point to.
 */
export async function deleteProperties(propertyIds) {
  if (!propertyIds.length) return;
  await prisma.$transaction(async (tx) => {
    const unitIds = (await tx.unit.findMany({ where: { propertyId: { in: propertyIds } }, select: { id: true } })).map((u) => u.id);
    const tenantIds = (await tx.tenant.findMany({ where: { unitId: { in: unitIds } }, select: { id: true } })).map((t) => t.id);
    const ticketIds = (await tx.ticket.findMany({
      where: { OR: [{ unitId: { in: unitIds } }, { tenantId: { in: tenantIds } }] },
      select: { id: true },
    })).map((t) => t.id);
    // Vacancy.unitId is a plain id (no foreign key), so its rows would otherwise be left pointing at nothing
    const vacancyIds = (await tx.vacancy.findMany({ where: { unitId: { in: unitIds } }, select: { id: true } })).map((v) => v.id);
    const applicantIds = (await tx.applicant.findMany({ where: { vacancyId: { in: vacancyIds } }, select: { id: true } })).map((a) => a.id);

    await tx.document.deleteMany({
      where: {
        OR: [
          { unitId: { in: unitIds } },
          { tenantId: { in: tenantIds } },
          { ticketId: { in: ticketIds } },
          { applicantId: { in: applicantIds } },
        ],
      },
    });
    await tx.applicant.deleteMany({ where: { id: { in: applicantIds } } });
    await tx.vacancy.deleteMany({ where: { id: { in: vacancyIds } } });
    await tx.ticketUpdate.deleteMany({ where: { ticketId: { in: ticketIds } } });
    await tx.ticket.deleteMany({ where: { id: { in: ticketIds } } });
    await tx.message.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await tx.rentPayment.deleteMany({ where: { OR: [{ unitId: { in: unitIds } }, { tenantId: { in: tenantIds } }] } });
    await tx.feedback.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await tx.expense.deleteMany({ where: { unitId: { in: unitIds } } });
    await tx.tenant.deleteMany({ where: { id: { in: tenantIds } } });
    await tx.unit.deleteMany({ where: { id: { in: unitIds } } });
    await tx.property.deleteMany({ where: { id: { in: propertyIds } } });
  });
}
