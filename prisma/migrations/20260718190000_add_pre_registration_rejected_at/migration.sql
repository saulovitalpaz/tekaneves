ALTER TABLE "PreRegistration" ADD COLUMN "rejectedAt" TIMESTAMP(3);

CREATE INDEX "PreRegistration_rejectedAt_createdAt_idx" ON "PreRegistration"("rejectedAt", "createdAt");
