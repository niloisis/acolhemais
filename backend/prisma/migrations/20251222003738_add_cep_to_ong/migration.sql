/*
  Warnings:

  - You are about to drop the column `bairro` on the `acao` table. All the data in the column will be lost.
  - Added the required column `bairroId` to the `ong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `ong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `ong` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `acao` DROP COLUMN `bairro`,
    ADD COLUMN `bairroId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ong` ADD COLUMN `bairroId` VARCHAR(191) NOT NULL,
    ADD COLUMN `cep` VARCHAR(255) NOT NULL,
    ADD COLUMN `numero` VARCHAR(10) NOT NULL;

-- AddForeignKey
ALTER TABLE `ong` ADD CONSTRAINT `ong_bairroId_fkey` FOREIGN KEY (`bairroId`) REFERENCES `bairros`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acao` ADD CONSTRAINT `acao_bairroId_fkey` FOREIGN KEY (`bairroId`) REFERENCES `bairros`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
