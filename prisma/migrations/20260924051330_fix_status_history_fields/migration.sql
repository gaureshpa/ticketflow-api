/*
  Warnings:

  - You are about to drop the column `formStatus` on the `StatusHistory` table. All the data in the column will be lost.
  - Added the required column `fromStatus` to the `StatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatusHistory" DROP COLUMN "formStatus",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromStatus" "TicketStatus" NOT NULL;
