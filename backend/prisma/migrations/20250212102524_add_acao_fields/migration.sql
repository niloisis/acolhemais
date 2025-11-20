/*
  Warnings:

  - Added the required column `como_participar` to the `acao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descricao` to the `acao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link_contato` to the `acao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `acao` ADD COLUMN `como_participar` TEXT NOT NULL,
    ADD COLUMN `descricao` TEXT NOT NULL,
    ADD COLUMN `link_contato` TEXT NOT NULL;
