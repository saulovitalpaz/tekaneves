ALTER TABLE "HomepageQuoteSettings"
ALTER COLUMN "isQuoteCardVisible" SET DEFAULT true;

UPDATE "HomepageQuoteSettings"
SET "isQuoteCardVisible" = true;
