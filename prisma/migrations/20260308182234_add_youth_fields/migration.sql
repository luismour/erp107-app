/*
  Warnings:

  - Added the required column `age` to the `Youth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch` to the `Youth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Youth" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "branch" TEXT NOT NULL;
