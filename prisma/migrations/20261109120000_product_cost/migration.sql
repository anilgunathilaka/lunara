-- CreateTable
CREATE TABLE "product_cost" (
    "sku" TEXT NOT NULL,
    "fabric" INTEGER NOT NULL DEFAULT 0,
    "otherMaterials" INTEGER NOT NULL DEFAULT 0,
    "sewing" INTEGER NOT NULL DEFAULT 0,
    "transport" INTEGER NOT NULL DEFAULT 0,
    "other" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_cost_pkey" PRIMARY KEY ("sku")
);

-- AddForeignKey
ALTER TABLE "product_cost" ADD CONSTRAINT "product_cost_sku_fkey" FOREIGN KEY ("sku") REFERENCES "stock_item"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- Costs are never negative, enforced by the database as well as the app.
ALTER TABLE "product_cost" ADD CONSTRAINT "product_cost_non_negative"
  CHECK ("fabric" >= 0 AND "otherMaterials" >= 0 AND "sewing" >= 0 AND "transport" >= 0 AND "other" >= 0);

-- Costs are commercially sensitive: never served by Supabase's Data API
-- (docs/4-architecture.md §2.2). RLS on, no policies.
ALTER TABLE "product_cost" ENABLE ROW LEVEL SECURITY;
