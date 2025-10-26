/*
  Warnings:

  - You are about to drop the column `flagUrl` on the `country` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `country` DROP COLUMN `flagUrl`,
    ADD COLUMN `flag_url` VARCHAR(191) NULL;
