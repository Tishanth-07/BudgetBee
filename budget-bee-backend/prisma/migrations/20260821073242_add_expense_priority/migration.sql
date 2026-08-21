/*
  Warnings:

  - You are about to drop the column `priority` on the `Expense` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "priority",
ADD COLUMN     "priorityLevel" "Priority" NOT NULL DEFAULT 'MEDIUM';
