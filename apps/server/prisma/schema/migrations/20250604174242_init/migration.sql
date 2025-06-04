-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('OFF', 'RUNNING', 'STARTING', 'ERROR');

-- CreateEnum
CREATE TYPE "RightLevel" AS ENUM ('ADMIN', 'WRITE', 'READ');

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Right" ADD CONSTRAINT "Right_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Right" ADD CONSTRAINT "Right_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
