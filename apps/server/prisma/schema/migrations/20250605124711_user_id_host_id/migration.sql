/*
  Warnings:

  - A unique constraint covering the columns `[hostId,userId]` on the table `Right` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Right_hostId_userId_key" ON "Right"("hostId", "userId");
