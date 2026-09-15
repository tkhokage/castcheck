ALTER TABLE "Opportunity" ADD COLUMN "sourceEvidence" JSONB;
ALTER TABLE "Opportunity" ADD COLUMN "importKey" TEXT;
CREATE UNIQUE INDEX "Opportunity_importKey_key" ON "Opportunity"("importKey");
