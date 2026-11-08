-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('admin');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "courier" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "staff_member" (
    "email" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_member_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_createdAt_idx" ON "audit_log"("entityType", "entityId", "createdAt");

-- ─── Hand-written additions ──────────────────────────────────────────────

-- Staff emails and the audit trail must never be served by Supabase's
-- Data API (docs/4-architecture.md §2.2, §3.5). RLS on, no policies.
ALTER TABLE "staff_member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;

-- Stored lower-case so lookups match the signed-in email exactly.
ALTER TABLE "staff_member" ADD CONSTRAINT "staff_member_email_lowercase" CHECK ("email" = lower("email"));
