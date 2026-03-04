-- CreateEnum
CREATE TYPE "ManagedDatabaseType" AS ENUM ('POSTGRESQL', 'MARIADB');

-- CreateEnum
CREATE TYPE "ManagedDatabaseStatus" AS ENUM ('CREATING', 'RUNNING', 'UPGRADING', 'OFF');

-- CreateEnum
CREATE TYPE "DatabaseBackupStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'DONE');

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

-- AddForeignKey
ALTER TABLE "DatabaseBackup" ADD CONSTRAINT "DatabaseBackup_targetDatabaseId_fkey" FOREIGN KEY ("targetDatabaseId") REFERENCES "ManagedDatabase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
