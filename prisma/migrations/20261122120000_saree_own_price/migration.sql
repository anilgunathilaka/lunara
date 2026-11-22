-- PRD v4.2 (founder decision 2026-11-22): every saree has its own price.
-- Adds curated_listing.price and fills it with each saree's current price
-- (its design × category cell), so no price in the shop changes. Nothing
-- is deleted; price_matrix stays (it seeds new sarees and prices Design
-- Your Own).

ALTER TABLE "curated_listing" ADD COLUMN "price" INTEGER;

UPDATE "curated_listing" AS l
SET "price" = pm."price"
FROM "saree_colourway" AS s
JOIN "price_matrix" AS pm ON pm."designId" = s."designId" AND pm."materialId" = s."materialId"
WHERE s."id" = l."sareeColourwayId";

ALTER TABLE "curated_listing" ALTER COLUMN "price" SET NOT NULL;
