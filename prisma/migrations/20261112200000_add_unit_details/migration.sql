-- AlterTable
-- Optional layout details for a unit, shown on the public website for vacant units.
ALTER TABLE "Unit" ADD COLUMN "bedrooms" INTEGER,
ADD COLUMN "bathrooms" DOUBLE PRECISION,
ADD COLUMN "squareFeet" INTEGER;
