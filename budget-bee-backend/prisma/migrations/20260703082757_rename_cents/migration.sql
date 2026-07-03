-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CASH', 'CARD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- Account
ALTER TABLE "Account" DROP COLUMN "balance";
ALTER TABLE "Account" RENAME COLUMN "balanceCents" TO "balance";
ALTER TABLE "Account" ALTER COLUMN "balance" SET DEFAULT 0;
ALTER TABLE "Account" ALTER COLUMN "type" TYPE "AccountType" USING UPPER("type")::"AccountType";
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT 'BANK';

-- Expense
ALTER TABLE "Expense" DROP COLUMN "amount";
ALTER TABLE "Expense" RENAME COLUMN "amountCents" TO "amount";

-- Goal
ALTER TABLE "Goal" DROP COLUMN "savedAmount";
ALTER TABLE "Goal" DROP COLUMN "targetAmount";
ALTER TABLE "Goal" RENAME COLUMN "savedAmountCents" TO "savedAmount";
ALTER TABLE "Goal" RENAME COLUMN "targetAmountCents" TO "targetAmount";
ALTER TABLE "Goal" ALTER COLUMN "savedAmount" SET DEFAULT 0;

-- IncomeSource
ALTER TABLE "IncomeSource" DROP COLUMN "amount";
ALTER TABLE "IncomeSource" RENAME COLUMN "amountCents" TO "amount";

-- Transaction
ALTER TABLE "Transaction" DROP COLUMN "amount";
ALTER TABLE "Transaction" RENAME COLUMN "amountCents" TO "amount";
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType" USING UPPER("type")::"TransactionType";
