-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "targetAmount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "IncomeSource" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" DROP DEFAULT;
