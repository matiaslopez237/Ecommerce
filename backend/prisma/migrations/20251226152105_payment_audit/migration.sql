-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ARS',
ADD COLUMN     "merchantOrderId" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "rawPayment" JSONB,
ADD COLUMN     "statusDetail" TEXT,
ALTER COLUMN "provider" SET DEFAULT 'MERCADOPAGO';

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_merchantOrderId_idx" ON "Payment"("merchantOrderId");
