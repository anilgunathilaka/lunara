-- Founder decision 2026-11-23: a "Top sell" section on the home page.
-- The admin picks which sarees appear in it, and can hide the whole section.
-- Adds only: one column (false for every existing saree, so nothing shows
-- until the admin ticks one) and one new, empty table. No existing row or
-- value changes, nothing is deleted.

ALTER TABLE "curated_listing" ADD COLUMN "isTopSeller" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "site_setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_setting_pkey" PRIMARY KEY ("key")
);
