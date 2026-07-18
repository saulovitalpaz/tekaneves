-- CreateTable
CREATE TABLE "HomepageInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "HomepageInquiry_readAt_createdAt_idx" ON "HomepageInquiry"("readAt", "createdAt");

-- CreateIndex
CREATE INDEX "HomepageInquiry_source_createdAt_idx" ON "HomepageInquiry"("source", "createdAt");
