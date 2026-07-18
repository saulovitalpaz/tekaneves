-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TherapistProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialty" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TherapistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TherapistProfile" ("bio", "createdAt", "id", "specialty", "updatedAt", "userId") SELECT "bio", "createdAt", "id", "specialty", "updatedAt", "userId" FROM "TherapistProfile";
DROP TABLE "TherapistProfile";
ALTER TABLE "new_TherapistProfile" RENAME TO "TherapistProfile";
CREATE UNIQUE INDEX "TherapistProfile_userId_key" ON "TherapistProfile"("userId");
CREATE INDEX "TherapistProfile_isPrimary_idx" ON "TherapistProfile"("isPrimary");
UPDATE "TherapistProfile"
SET "isPrimary" = true
WHERE "userId" = (SELECT "id" FROM "User" WHERE "email" = 'terapeuta@teka.local');
CREATE UNIQUE INDEX "TherapistProfile_isPrimary_unique" ON "TherapistProfile"("isPrimary") WHERE "isPrimary" = 1;
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
