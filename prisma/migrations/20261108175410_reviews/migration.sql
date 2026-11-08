-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('published', 'hidden');

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "listingId" TEXT,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "locale" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'published',
    "hiddenReason" TEXT,
    "hiddenBy" TEXT,
    "response" TEXT,
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_orderLineId_key" ON "review"("orderLineId");

-- CreateIndex
CREATE INDEX "review_listingId_status_createdAt_idx" ON "review"("listingId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "review_status_createdAt_idx" ON "review"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A rating is 1 to 5, enforced by the database as well as the app.
ALTER TABLE "review" ADD CONSTRAINT "review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

-- Reviews hold names and order links: never served by Supabase's Data API
-- (docs/4-architecture.md §2.2). RLS on, no policies.
ALTER TABLE "review" ENABLE ROW LEVEL SECURITY;
