-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('office', 'everyday', 'festive', 'temple');

-- CreateEnum
CREATE TYPE "Opacity" AS ENUM ('opaque', 'semi_sheer', 'sheer');

-- CreateTable
CREATE TABLE "saree_design" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "patternAssetUrl" TEXT,
    "placementMap" JSONB,
    "occasionTags" "Occasion"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saree_design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotton_material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gsm" INTEGER NOT NULL,
    "opacity" "Opacity" NOT NULL,
    "lengthMetres" DECIMAL(4,2) NOT NULL,
    "textureOverlayUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotton_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_matrix" (
    "designId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_matrix_pkey" PRIMARY KEY ("designId","materialId")
);

-- CreateTable
CREATE TABLE "saree_colourway" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "colourName" TEXT NOT NULL,
    "colourHex" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "referenceFrameUrl" TEXT,
    "galleryAssets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sku" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saree_colourway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jacket_material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "composition" TEXT NOT NULL,
    "pieceLengthMetres" DECIMAL(4,2) NOT NULL,
    "pairingAddOn" INTEGER NOT NULL DEFAULT 0,
    "standalonePrice" INTEGER NOT NULL,
    "textureTileUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jacket_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jacket_colourway" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "colourName" TEXT NOT NULL,
    "colourHex" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "swatchUrl" TEXT,
    "textureTileUrl" TEXT,
    "sku" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jacket_colourway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_item" (
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_item_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "curated_listing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sareeColourwayId" TEXT NOT NULL,
    "jacketColourwayId" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curated_listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saree_colourway_sku_key" ON "saree_colourway"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "saree_colourway_designId_materialId_colourName_key" ON "saree_colourway"("designId", "materialId", "colourName");

-- CreateIndex
CREATE UNIQUE INDEX "jacket_colourway_sku_key" ON "jacket_colourway"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "jacket_colourway_materialId_colourName_key" ON "jacket_colourway"("materialId", "colourName");

-- CreateIndex
CREATE INDEX "curated_listing_active_sortOrder_idx" ON "curated_listing"("active", "sortOrder");

-- AddForeignKey
ALTER TABLE "price_matrix" ADD CONSTRAINT "price_matrix_designId_fkey" FOREIGN KEY ("designId") REFERENCES "saree_design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_matrix" ADD CONSTRAINT "price_matrix_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "cotton_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saree_colourway" ADD CONSTRAINT "saree_colourway_designId_fkey" FOREIGN KEY ("designId") REFERENCES "saree_design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saree_colourway" ADD CONSTRAINT "saree_colourway_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "cotton_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saree_colourway" ADD CONSTRAINT "saree_colourway_designId_materialId_fkey" FOREIGN KEY ("designId", "materialId") REFERENCES "price_matrix"("designId", "materialId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saree_colourway" ADD CONSTRAINT "saree_colourway_sku_fkey" FOREIGN KEY ("sku") REFERENCES "stock_item"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jacket_colourway" ADD CONSTRAINT "jacket_colourway_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "jacket_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jacket_colourway" ADD CONSTRAINT "jacket_colourway_sku_fkey" FOREIGN KEY ("sku") REFERENCES "stock_item"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curated_listing" ADD CONSTRAINT "curated_listing_sareeColourwayId_fkey" FOREIGN KEY ("sareeColourwayId") REFERENCES "saree_colourway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curated_listing" ADD CONSTRAINT "curated_listing_jacketColourwayId_fkey" FOREIGN KEY ("jacketColourwayId") REFERENCES "jacket_colourway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Hand-written additions (not expressible in schema.prisma) ───────────

-- Money and stock invariants (docs/4-architecture.md §3.2, §3.3). Stock can
-- never go negative, so concurrent orders on the last unit fail instead of
-- overselling.
ALTER TABLE "price_matrix" ADD CONSTRAINT "price_matrix_price_positive" CHECK ("price" > 0);
ALTER TABLE "jacket_material" ADD CONSTRAINT "jacket_material_pairing_add_on_non_negative" CHECK ("pairingAddOn" >= 0);
ALTER TABLE "jacket_material" ADD CONSTRAINT "jacket_material_standalone_price_positive" CHECK ("standalonePrice" > 0);
ALTER TABLE "stock_item" ADD CONSTRAINT "stock_item_quantity_non_negative" CHECK ("quantity" >= 0);
ALTER TABLE "stock_item" ADD CONSTRAINT "stock_item_threshold_non_negative" CHECK ("threshold" >= 0);

-- Supabase's Data API must never serve these tables (§2.2): with RLS on and
-- no policies, the anon/authenticated roles get nothing. The app connects
-- as the table owner, which RLS does not restrict.
ALTER TABLE "saree_design" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cotton_material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "price_matrix" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saree_colourway" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jacket_material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jacket_colourway" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "curated_listing" ENABLE ROW LEVEL SECURITY;
