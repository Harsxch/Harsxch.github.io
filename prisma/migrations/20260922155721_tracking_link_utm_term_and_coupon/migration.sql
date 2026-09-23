-- AlterTable
ALTER TABLE "TrackingLink" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- AddForeignKey
ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
