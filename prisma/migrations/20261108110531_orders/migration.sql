-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('placed', 'payment_pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled', 'return_requested', 'refunded', 'exchanged');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cod', 'bank_transfer', 'lankaqr', 'card');

-- CreateEnum
CREATE TYPE "OrderLineKind" AS ENUM ('listing', 'configured', 'jacket');

-- CreateEnum
CREATE TYPE "Drape" AS ENUM ('saree', 'osariya');

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "addressLine" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "eventDate" DATE,
    "unstitchedAcknowledgedAt" TIMESTAMP(3) NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL,
    "codFee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "estimateMinDays" INTEGER NOT NULL,
    "estimateMaxDays" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "accessTokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" "OrderLineKind" NOT NULL,
    "listingId" TEXT,
    "designId" TEXT,
    "materialId" TEXT,
    "sareeColourwayId" TEXT,
    "jacketColourwayId" TEXT NOT NULL,
    "sareeSku" TEXT,
    "jacketSku" TEXT NOT NULL,
    "drape" "Drape",
    "title" TEXT NOT NULL,
    "materialName" TEXT,
    "sareeColourName" TEXT,
    "jacketMaterialName" TEXT NOT NULL,
    "jacketColourName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_event" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_number_key" ON "order"("number");

-- CreateIndex
CREATE INDEX "order_status_createdAt_idx" ON "order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "order_phone_idx" ON "order"("phone");

-- CreateIndex
CREATE INDEX "order_line_orderId_idx" ON "order_line"("orderId");

-- CreateIndex
CREATE INDEX "order_event_orderId_createdAt_idx" ON "order_event"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_event" ADD CONSTRAINT "order_event_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Hand-written additions (not expressible in schema.prisma) ───────────

-- Money and quantity invariants (docs/4-architecture.md §3.4).
ALTER TABLE "order" ADD CONSTRAINT "order_amounts_non_negative"
  CHECK ("subtotal" > 0 AND "deliveryFee" >= 0 AND "codFee" >= 0 AND "total" = "subtotal" + "deliveryFee" + "codFee");
ALTER TABLE "order" ADD CONSTRAINT "order_estimate_range" CHECK ("estimateMinDays" > 0 AND "estimateMaxDays" >= "estimateMinDays");
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_quantity_range" CHECK ("quantity" BETWEEN 1 AND 5);
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_unit_price_positive" CHECK ("unitPrice" > 0);

-- Personal data: Supabase's Data API must never serve these (§2.2). RLS on,
-- no policies; the app connects as the table owner.
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_line" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_event" ENABLE ROW LEVEL SECURITY;
