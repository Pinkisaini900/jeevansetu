-- CreateTable
CREATE TABLE "Hospital" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "emergencyServices" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "traumaAvailable" BOOLEAN NOT NULL,
    "icuAvailable" BOOLEAN NOT NULL,
    "contactName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Ambulance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ambulanceNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "EmergencyRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ambulanceId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientAge" INTEGER NOT NULL,
    "patientGender" TEXT NOT NULL,
    "emergencyType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedHospitalId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CREATED'
);

-- CreateTable
CREATE TABLE "HospitalResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emergencyRequestId" TEXT NOT NULL,
    "hospitalId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "HospitalResponse_emergencyRequestId_fkey" FOREIGN KEY ("emergencyRequestId") REFERENCES "EmergencyRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HospitalResponse_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_username_key" ON "Hospital"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ambulance_ambulanceNumber_key" ON "Ambulance"("ambulanceNumber");
