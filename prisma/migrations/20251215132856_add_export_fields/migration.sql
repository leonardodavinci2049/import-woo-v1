-- AlterTable
ALTER TABLE `tbl_product_woo` ADD COLUMN `exportdat` DATETIME(0) NULL,
    ADD COLUMN `flag_export` SMALLINT NULL DEFAULT 0;
