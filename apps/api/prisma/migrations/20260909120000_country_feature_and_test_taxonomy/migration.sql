-- Country features and accepted English tests become master data.
--
-- Both were hard-coded lists in the API and a duplicated copy in the Admin
-- form, so adding one needed a release. The `code` column deliberately carries
-- the same values the constants used, because published country configurations
-- store those codes and the public surface matches on them -- existing rows and
-- filters keep working untouched.
CREATE TABLE `country_features` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `display_order` INT NOT NULL DEFAULT 0,
  `is_system` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `country_features_code_key`(`code`),
  UNIQUE INDEX `country_features_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE `country_english_tests` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `display_order` INT NOT NULL DEFAULT 0,
  `is_system` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `country_english_tests_code_key`(`code`),
  UNIQUE INDEX `country_english_tests_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- The options that shipped as constants, marked as system so they cannot be
-- deleted and so re-running this is a no-op.
INSERT INTO `country_features` (`id`, `code`, `name`, `display_order`, `is_system`, `updated_at`) VALUES
  (UUID(), 'BUDGET_FRIENDLY', 'Budget friendly', 1, true, NOW(3)),
  (UUID(), 'IELTS_OPTIONAL', 'IELTS optional', 2, true, NOW(3)),
  (UUID(), 'HIGH_VISA_SUCCESS', 'High visa success', 3, true, NOW(3)),
  (UUID(), 'PR_FRIENDLY', 'PR friendly', 4, true, NOW(3)),
  (UUID(), 'TOP_RANKED_UNIVERSITIES', 'Top ranked universities', 5, true, NOW(3)),
  (UUID(), 'PART_TIME_ALLOWED', 'Part-time allowed', 6, true, NOW(3)),
  (UUID(), 'POST_STUDY_WORK_AVAILABLE', 'Post-study work available', 7, true, NOW(3)),
  (UUID(), 'LANGUAGE_WAIVER', 'Language waiver', 8, true, NOW(3))
ON DUPLICATE KEY UPDATE `is_system` = true;

INSERT INTO `country_english_tests` (`id`, `code`, `name`, `display_order`, `is_system`, `updated_at`) VALUES
  (UUID(), 'IELTS', 'IELTS', 1, true, NOW(3)),
  (UUID(), 'TOEFL', 'TOEFL', 2, true, NOW(3)),
  (UUID(), 'PTE', 'PTE', 3, true, NOW(3))
ON DUPLICATE KEY UPDATE `is_system` = true;
