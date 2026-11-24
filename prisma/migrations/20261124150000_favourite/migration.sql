-- Founder decision 2026-11-24: favourite sarees on the customer profile.
-- Adds one new, empty table. No existing row or value changes, nothing is
-- deleted. A favourite goes when its customer account or saree is deleted.

-- CreateTable
CREATE TABLE "favourite" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourite_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateIndex
CREATE INDEX "favourite_listingId_idx" ON "favourite"("listingId");

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "curated_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

