-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "balanceCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "amountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "savedAmountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetAmountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "IncomeSource" ADD COLUMN     "amountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "amountCents" INTEGER NOT NULL DEFAULT 0;
