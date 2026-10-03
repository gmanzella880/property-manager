-- AlterTable
-- `password` was a leftover column from the pre-Logto auth system.
-- schema.prisma has no `password` field, so Prisma's generated
-- landlord.create() never supplies it, which violated this column's
-- NOT NULL constraint on every first-time admin sign-in.
ALTER TABLE "Landlord" DROP COLUMN "password";
