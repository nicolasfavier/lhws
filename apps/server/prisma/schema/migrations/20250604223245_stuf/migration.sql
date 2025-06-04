-- CreateEnum
CREATE TYPE "VMStatus" AS ENUM ('OFF', 'RUNNING');

-- CreateTable
CREATE TABLE "VM" (
    "id" UUID NOT NULL,
    "status" "VMStatus" NOT NULL,
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
