-- CreateTable
CREATE TABLE `tbl_product_woo` (
    `product_id` INTEGER NOT NULL,
    `post_id` INTEGER NULL,
    `product_name` VARCHAR(300) NULL,
    `product_url` VARCHAR(500) NULL,
    `slug` VARCHAR(300) NULL,
    `image_main` VARCHAR(500) NULL,
    `image1` VARCHAR(500) NULL,
    `image2` VARCHAR(500) NULL,
    `image3` VARCHAR(500) NULL,
    `image4` VARCHAR(500) NULL,
    `image5` VARCHAR(500) NULL,
    `carta_venda` LONGTEXT NULL,
    `descricao` LONGTEXT NULL,
    `createdat` DATETIME(0) NULL,
    `flag_content` SMALLINT NULL DEFAULT 0,
    `updatedat` DATETIME(0) NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

