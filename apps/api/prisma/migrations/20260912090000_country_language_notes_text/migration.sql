-- The four per-test English notes become TEXT.
--
-- They are authored in the same WYSIWYG as every other profile note, so a
-- five-hundred character column was never the right shape for them: one
-- paragraph explaining what a destination actually asks for passes it without
-- trying. The request contract had to stop at 500 to match the column, and an
-- author who wrote more got a 400 naming a field rather than a saved record.
-- The other note columns on this table -- waiver_notes, general_notes,
-- disclaimer -- are already TEXT; this brings the per-test four into line.
--
-- Widening only. VARCHAR(500) to TEXT preserves every stored value, and the
-- longest one in the catalogue is well under a hundred characters. Nothing is
-- dropped and no column is recreated.
--
-- The charset and collation are stated rather than inherited, for the same
-- reason the surrounding migrations state them: this table is
-- utf8mb4_unicode_ci and a column left to MySQL 8's default would land on
-- utf8mb4_0900_ai_ci.
--
-- FOREIGN_KEY_CHECKS is off for the rebuild, and that is not incidental.
-- Changing a column between VARCHAR and TEXT is not an in-place operation in
-- InnoDB: the server copies the table, and copying re-validates every foreign
-- key on it. This table holds rows whose country was hard-deleted at some point
-- without the delete cascading -- twenty-six of twenty-seven of them on the
-- deployed catalogue -- so that re-validation fails with errno 1452 and takes
-- the whole deploy with it. Suppressing the check for the rebuild keeps those
-- rows exactly as they are: the constraint itself is untouched and still
-- governs every write after this. Deleting the orphans instead would be a
-- destructive change to production data, which a column widening has no
-- business making on its own.
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `country_language_requirements`
  MODIFY `ielts_notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  MODIFY `pte_notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  MODIFY `toefl_notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  MODIFY `duolingo_notes` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

SET FOREIGN_KEY_CHECKS = 1;
