-- Clerk user id of the tenant, linked on their first sign-in
ALTER TABLE "Tenant" ADD COLUMN "authId" TEXT;
CREATE UNIQUE INDEX "Tenant_authId_key" ON "Tenant"("authId");
