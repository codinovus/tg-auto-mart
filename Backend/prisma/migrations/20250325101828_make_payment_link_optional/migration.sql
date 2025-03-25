/*
  Warnings:

  - A unique constraint covering the columns `[productKeyId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `ProductKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "productKeyId" TEXT;

-- AlterTable
ALTER TABLE "ProductKey" ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_productKeyId_key" ON "Order"("productKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductKey_orderId_key" ON "ProductKey"("orderId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productKeyId_fkey" FOREIGN KEY ("productKeyId") REFERENCES "ProductKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
