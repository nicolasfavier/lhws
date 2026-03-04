-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('OFF', 'RUNNING', 'STARTING', 'ERROR');

-- CreateEnum
CREATE TYPE "RightLevel" AS ENUM ('ADMIN', 'WRITE', 'READ');

-- CreateEnum
CREATE TYPE "VMStatus" AS ENUM ('OFF', 'RUNNING');

-- CreateEnum
CREATE TYPE "ManagedDatabaseType" AS ENUM ('POSTGRESQL', 'MARIADB');

-- CreateEnum
CREATE TYPE "ManagedDatabaseStatus" AS ENUM ('CREATING', 'RUNNING', 'UPGRADING', 'OFF');

-- CreateEnum
CREATE TYPE "DatabaseBackupStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" UUID NOT NULL,
    "status" "HostStatus" NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "lastStatusChange" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Right" (
    "id" UUID NOT NULL,
    "level" "RightLevel" NOT NULL,
    "userId" UUID NOT NULL,
    "hostId" UUID NOT NULL,

    CONSTRAINT "Right_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VM" (
    "id" UUID NOT NULL,
    "status" "VMStatus" NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "lastStatusChange" TIMESTAMP(3) NOT NULL,
    "vCPU" INTEGER NOT NULL,
    "ramGB" INTEGER NOT NULL,
    "cpuAvgPercent" INTEGER NOT NULL,
    "ramAvgPercent" INTEGER NOT NULL,
    "cpuPeakPercent" INTEGER NOT NULL,
    "ramPeakPercent" INTEGER NOT NULL,

    CONSTRAINT "VM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "recipient" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiStatus" (
    "id" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,

    CONSTRAINT "ApiStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedDatabase" (
    "id" UUID NOT NULL,
    "type" "ManagedDatabaseType" NOT NULL,
    "clusterSize" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "lastStatusChange" TIMESTAMP(3) NOT NULL,
    "status" "ManagedDatabaseStatus" NOT NULL,
    "adminUser" TEXT NOT NULL,
    "adminPassword" TEXT NOT NULL,

    CONSTRAINT "ManagedDatabase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseBackup" (
    "id" UUID NOT NULL,
    "targetDatabaseId" UUID NOT NULL,
    "status" "DatabaseBackupStatus" NOT NULL,

    CONSTRAINT "DatabaseBackup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Right_hostId_userId_key" ON "Right"("hostId", "userId");

-- AddForeignKey
ALTER TABLE "Right" ADD CONSTRAINT "Right_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Right" ADD CONSTRAINT "Right_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseBackup" ADD CONSTRAINT "DatabaseBackup_targetDatabaseId_fkey" FOREIGN KEY ("targetDatabaseId") REFERENCES "ManagedDatabase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
