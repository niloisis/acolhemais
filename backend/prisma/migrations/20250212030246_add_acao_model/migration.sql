-- CreateTable
CREATE TABLE `acao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `dia` INTEGER NOT NULL,
    `mes` VARCHAR(20) NOT NULL,
    `ano` INTEGER NOT NULL,
    `inicio` VARCHAR(10) NOT NULL,
    `termino` VARCHAR(10) NOT NULL,
    `cep` VARCHAR(9) NOT NULL,
    `bairro` VARCHAR(255) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(10) NOT NULL,
    `complemento` VARCHAR(255) NULL,
    `ongId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_acao_nome_idx`(`nome`),
    INDEX `fk_acao_ong_idx`(`ongId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `acao` ADD CONSTRAINT `acao_ongId_fkey` FOREIGN KEY (`ongId`) REFERENCES `ong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
