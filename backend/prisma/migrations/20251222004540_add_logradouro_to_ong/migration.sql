/*
  Warnings:

  - Added the required column `logradouro` to the `acao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logradouro` to the `ong` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `acao` ADD COLUMN `logradouro` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `ong` ADD COLUMN `logradouro` VARCHAR(255) NOT NULL;
