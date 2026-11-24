-- Founder decision 2026-11-24: weight, length and opacity set saree by saree.
-- Adds three empty (NULL) columns. Weight is in grams (saree and jacket
-- material together); NULL means no weight is shown. NULL length or opacity
-- means "use the category's value", so every existing saree shows what it
-- shows today. No existing row or value changes, nothing is deleted.

-- AlterTable
ALTER TABLE "curated_listing" ADD COLUMN     "lengthMetres" DECIMAL(4,2),
ADD COLUMN     "opacity" "Opacity",
ADD COLUMN     "weightGrams" INTEGER;
