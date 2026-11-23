-- Founder decision 2026-11-23: the new-arrivals email goes only to customers
-- who tick "email me about new arrivals" at checkout (unticked by default).
-- Adds one empty, optional column; no existing row or value changes, nothing
-- is deleted. Existing orders stay without consent, so they get no
-- new-arrivals email.

ALTER TABLE "order" ADD COLUMN "marketingConsentAt" TIMESTAMP(3);
