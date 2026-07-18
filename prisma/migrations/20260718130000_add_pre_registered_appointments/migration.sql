-- CreateTable
CREATE TABLE "PreRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "note" TEXT,
    "linkedUserId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PreRegistration_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PreRegistration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreRegisteredAppointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "preRegistrationId" TEXT NOT NULL,
    "clientId" TEXT,
    "therapistId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "linkedAppointmentId" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 50,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PreRegisteredAppointment_preRegistrationId_fkey" FOREIGN KEY ("preRegistrationId") REFERENCES "PreRegistration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PreRegisteredAppointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PreRegisteredAppointment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PreRegisteredAppointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PreRegisteredAppointment_linkedAppointmentId_fkey" FOREIGN KEY ("linkedAppointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PreRegistration_linkedUserId_createdAt_idx" ON "PreRegistration"("linkedUserId", "createdAt");

-- CreateIndex
CREATE INDEX "PreRegistration_createdById_createdAt_idx" ON "PreRegistration"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "PreRegistration_email_idx" ON "PreRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PreRegisteredAppointment_linkedAppointmentId_key" ON "PreRegisteredAppointment"("linkedAppointmentId");

-- CreateIndex
CREATE INDEX "PreRegisteredAppointment_preRegistrationId_startAt_idx" ON "PreRegisteredAppointment"("preRegistrationId", "startAt");

-- CreateIndex
CREATE INDEX "PreRegisteredAppointment_clientId_startAt_status_idx" ON "PreRegisteredAppointment"("clientId", "startAt", "status");

-- CreateIndex
CREATE INDEX "PreRegisteredAppointment_therapistId_startAt_status_idx" ON "PreRegisteredAppointment"("therapistId", "startAt", "status");

-- CreateIndex
CREATE INDEX "PreRegisteredAppointment_createdById_createdAt_idx" ON "PreRegisteredAppointment"("createdById", "createdAt");
