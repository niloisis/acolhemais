/*
  Warnings:

  - Added the required column `lat` to the `acao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `acao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `acao` ADD COLUMN `lat` DOUBLE NOT NULL,
    ADD COLUMN `lon` DOUBLE NOT NULL;
