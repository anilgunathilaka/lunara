-- CreateEnum
CREATE TYPE "StockMovementKind" AS ENUM ('opening', 'created', 'adjustment', 'online_sale', 'online_cancel', 'office_sale', 'office_return');

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "kind" "StockMovementKind" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_movement_sku_createdAt_idx" ON "stock_movement"("sku", "createdAt");

-- CreateIndex
CREATE INDEX "stock_movement_createdAt_idx" ON "stock_movement"("createdAt");

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_sku_fkey" FOREIGN KEY ("sku") REFERENCES "stock_item"("sku") ON DELETE CASCADE ON UPDATE CASCADE;


-- The ledger starts today: one opening movement per existing SKU records the
-- quantity it already holds, so every later balance has a starting point.
-- Reads stock_item; changes nothing in it.
INSERT INTO "stock_movement" ("id", "sku", "kind", "delta", "balance", "note", "actor")
SELECT 'open_' || md5("sku"), "sku", 'opening', "quantity", "quantity", 'Opening balance', 'system'
FROM "stock_item";

-- Internal operations data: never served by Supabase's Data API
-- (docs/4-architecture.md §2.2). RLS on, no policies.
ALTER TABLE "stock_movement" ENABLE ROW LEVEL SECURITY;
