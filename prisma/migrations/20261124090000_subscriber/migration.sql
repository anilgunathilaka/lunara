-- Founder decision 2026-11-24: a subscribe form after the footer.
-- A customer leaves an email, a mobile number, or both, to hear about new
-- sarees. Adds only one new, empty table. No existing row or value changes,
-- nothing is deleted.

CREATE TABLE "subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "locale" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriber_email_key" ON "subscriber"("email");

CREATE UNIQUE INDEX "subscriber_phone_key" ON "subscriber"("phone");
