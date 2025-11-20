-- CreateTable
CREATE TABLE `ong_image` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `ong_id` VARCHAR(191) NOT NULL,

    INDEX `fk_ong_image_filename_idx`(`filename`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ong_image` ADD CONSTRAINT `ong_image_ong_id_fkey` FOREIGN KEY (`ong_id`) REFERENCES `ong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
