-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "email" TEXT,
    ADD COLUMN "openingHours" JSONB,
    ADD COLUMN "latitude" DECIMAL(10,8),
    ADD COLUMN "longitude" DECIMAL(11,8),
    ADD COLUMN "imageUrl" TEXT,
    ADD COLUMN "managerId" INTEGER,
    ADD COLUMN "description" TEXT,
    ADD COLUMN "taxRate" DECIMAL(5,2) DEFAULT 0.00,
    ADD COLUMN "timezone" TEXT DEFAULT 'America/Lima';

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;