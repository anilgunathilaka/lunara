-- CreateEnum
CREATE TYPE "OfficeSaleStatus" AS ENUM ('active', 'cancelled');

-- CreateEnum
CREATE TYPE "OfficePaymentMethod" AS ENUM ('cash', 'bank_transfer', 'card', 'other');

-- CreateTable
CREATE TABLE "office_customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_sale" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OfficeSaleStatus" NOT NULL DEFAULT 'active',
    "soldOn" DATE NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "discountReason" TEXT,
    "total" INTEGER NOT NULL,
    "note" TEXT,
    "soldBy" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_sale_line" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "kind" "OrderLineKind" NOT NULL,
    "listingId" TEXT,
    "jacketColourwayId" TEXT NOT NULL,
    "sareeSku" TEXT,
    "jacketSku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "office_sale_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_instalment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "office_instalment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "OfficePaymentMethod" NOT NULL,
    "paidOn" DATE NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "receivedBy" TEXT NOT NULL,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "voidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "office_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "office_customer_phone_key" ON "office_customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "office_sale_number_key" ON "office_sale"("number");

-- CreateIndex
CREATE INDEX "office_sale_status_soldOn_idx" ON "office_sale"("status", "soldOn");

-- CreateIndex
CREATE INDEX "office_sale_customerId_idx" ON "office_sale"("customerId");

-- CreateIndex
CREATE INDEX "office_sale_line_saleId_idx" ON "office_sale_line"("saleId");

-- CreateIndex
CREATE INDEX "office_instalment_dueDate_idx" ON "office_instalment"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "office_instalment_saleId_seq_key" ON "office_instalment"("saleId", "seq");

-- CreateIndex
CREATE INDEX "office_payment_saleId_idx" ON "office_payment"("saleId");

-- CreateIndex
CREATE INDEX "office_payment_paidOn_idx" ON "office_payment"("paidOn");

-- AddForeignKey
ALTER TABLE "office_sale" ADD CONSTRAINT "office_sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "office_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_sale_line" ADD CONSTRAINT "office_sale_line_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "office_sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_instalment" ADD CONSTRAINT "office_instalment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "office_sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_payment" ADD CONSTRAINT "office_payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "office_sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Money rules, enforced by the database as well as the app.
ALTER TABLE "office_sale" ADD CONSTRAINT "office_sale_amounts"
  CHECK ("subtotal" >= 0 AND "discount" >= 0 AND "discount" <= "subtotal" AND "total" = "subtotal" - "discount");
ALTER TABLE "office_sale" ADD CONSTRAINT "office_sale_discount_reason"
  CHECK ("discount" = 0 OR ("discountReason" IS NOT NULL AND length(trim("discountReason")) > 0));
ALTER TABLE "office_sale_line" ADD CONSTRAINT "office_sale_line_amounts" CHECK ("quantity" > 0 AND "unitPrice" >= 0);
ALTER TABLE "office_instalment" ADD CONSTRAINT "office_instalment_amounts" CHECK ("seq" BETWEEN 1 AND 3 AND "amount" > 0);
ALTER TABLE "office_payment" ADD CONSTRAINT "office_payment_amounts" CHECK ("amount" > 0);

-- Customer names, phones and payments: never served by Supabase's Data API
-- (docs/4-architecture.md §2.2). RLS on, no policies.
ALTER TABLE "office_customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "office_sale" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "office_sale_line" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "office_instalment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "office_payment" ENABLE ROW LEVEL SECURITY;
