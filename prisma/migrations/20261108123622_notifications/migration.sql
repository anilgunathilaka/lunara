-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('whatsapp', 'sms', 'email');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'manual', 'sent', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_status_dueAt_idx" ON "notification"("status", "dueAt");

-- CreateIndex
CREATE INDEX "notification_orderId_idx" ON "notification"("orderId");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Messages hold customer phone numbers and addresses-in-text: never served
-- by Supabase's Data API (docs/4-architecture.md §2.2). RLS on, no policies.
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
