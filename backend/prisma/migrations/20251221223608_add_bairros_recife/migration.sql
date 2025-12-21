-- CreateTable
CREATE TABLE `bairros` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL DEFAULT 'Recife',
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bairros_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
