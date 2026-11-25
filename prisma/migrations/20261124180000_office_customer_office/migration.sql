-- Where the office customer works (founder decision 2026-11-24): shown and
-- filtered on the office Customers tab. Additive and nullable: existing
-- customers keep working with no office set.
ALTER TABLE "office_customer" ADD COLUMN "office" TEXT;
CREATE INDEX "office_customer_office_idx" ON "office_customer"("office");
