CREATE TABLE "HomepageQuoteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isQuoteCardVisible" BOOLEAN NOT NULL DEFAULT false,
    "isAutoGenerateActive" BOOLEAN NOT NULL DEFAULT false,
    "manualQuoteText" TEXT NOT NULL,
    "manualQuoteAuthor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
