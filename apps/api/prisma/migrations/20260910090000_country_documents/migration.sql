-- The documents a student needs in order to study in a destination.
--
-- Owned by the country rather than shared: two countries asking for "Proof of
-- funds" mean different things by it, and neither should edit the other's. The
-- Admin writes the list from a set of suggestions plus anything it needs of its
-- own, so there is no code column and nothing to seed.
--
-- The collation is stated rather than left to the server: `countries` is
-- utf8mb4_unicode_ci, and a table created under MySQL 8's default
-- utf8mb4_0900_ai_ci cannot carry a foreign key to it.
CREATE TABLE `country_documents` (
  `id` CHAR(36) NOT NULL,
  `country_id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `details` LONGTEXT NULL,
  `is_required` BOOLEAN NOT NULL DEFAULT true,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `country_documents_country_id_display_order_idx`(`country_id`, `display_order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `country_documents`
  ADD CONSTRAINT `country_documents_country_id_fkey`
  FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
