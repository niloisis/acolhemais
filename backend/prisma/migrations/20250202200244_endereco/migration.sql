/*
  Warnings:

  - Added the required column `endereco` to the `ong` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ong`
    ADD COLUMN `endereco` VARCHAR(255) NOT NULL;
