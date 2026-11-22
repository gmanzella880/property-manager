-- Rent payment ledger (Stripe and manually recorded payments)
-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'succeeded',
    "source" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "recordedBy" TEXT NOT NULL DEFAULT '',
    "voidReason" TEXT NOT NULL DEFAULT '',
    "voidedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentPayment_stripeSessionId_key" ON "RentPayment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "RentPayment_tenantId_period_idx" ON "RentPayment"("tenantId", "period");

-- CreateIndex
CREATE INDEX "RentPayment_period_idx" ON "RentPayment"("period");

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

