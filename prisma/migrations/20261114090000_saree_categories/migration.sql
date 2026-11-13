-- Saree categories and product codes (PRD v4.0, founder decision 2026-11-14).
--
-- Plain Cotton and Super Cotton are withdrawn; each cotton_material row is now
-- a saree category. Nothing is deleted: the plain and super rows (and their
-- price_matrix rows) stay, made inactive, because a past order points at one.
-- Every current product moves to Cotton sarees at the price it has today, and
-- gets a product code LSC001 … in shop order.

-- 1. Category columns: product-code prefix, next running number, display order.
ALTER TABLE "cotton_material" ADD COLUMN "codePrefix" TEXT;
ALTER TABLE "cotton_material" ADD COLUMN "nextNumber" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "cotton_material" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "cotton_material_codePrefix_key" ON "cotton_material"("codePrefix");

-- 2. The four categories. GSM, opacity and length start from Plain Cotton's
--    values; the admin corrects each category's own values on its page.
INSERT INTO "cotton_material" ("id", "name", "gsm", "opacity", "lengthMetres", "codePrefix", "nextNumber", "sortOrder", "active", "updatedAt")
SELECT v.id, v.name, p."gsm", p."opacity", p."lengthMetres", v.prefix, 1, v.ord, true, CURRENT_TIMESTAMP
FROM (VALUES
  ('cotton', 'Cotton sarees', 'LSC', 0),
  ('handloom', 'Handloom sarees', 'LSH', 1),
  ('batik', 'Batik sarees', 'LSB', 2),
  ('hand-painting', 'Hand painting sarees', 'LSHP', 3)
) AS v(id, name, prefix, ord)
CROSS JOIN (SELECT "gsm", "opacity", "lengthMetres" FROM "cotton_material" WHERE "id" = 'plain') AS p;

-- 3. Cotton prices: for each design, the price its current product sells at
--    (the price of the material its colourway uses today), so no price changes.
INSERT INTO "price_matrix" ("designId", "materialId", "price", "updatedAt")
SELECT DISTINCT ON (c."designId") c."designId", 'cotton', pm."price", CURRENT_TIMESTAMP
FROM "saree_colourway" c
JOIN "price_matrix" pm ON pm."designId" = c."designId" AND pm."materialId" = c."materialId"
WHERE c."materialId" IN ('plain', 'super')
ORDER BY c."designId", c."materialId";

-- 4. Every colourway moves to Cotton sarees (stock lines and products follow it).
UPDATE "saree_colourway" SET "materialId" = 'cotton', "updatedAt" = CURRENT_TIMESTAMP
WHERE "materialId" IN ('plain', 'super');

-- 5. Plain and Super: kept for past orders, no longer offered.
UPDATE "cotton_material" SET "active" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN ('plain', 'super');

-- 6. Product codes: LSC001 … for the current products, in shop order.
ALTER TABLE "curated_listing" ADD COLUMN "productCode" TEXT;
CREATE UNIQUE INDEX "curated_listing_productCode_key" ON "curated_listing"("productCode");

UPDATE "curated_listing" l
SET "productCode" = 'LSC' || LPAD(n.rn::text, 3, '0')
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "sortOrder", "id") AS rn FROM "curated_listing") n
WHERE l."id" = n."id";

UPDATE "cotton_material"
SET "nextNumber" = (SELECT COUNT(*) FROM "curated_listing") + 1
WHERE "id" = 'cotton';
