-- Country becomes a CMS record: the name is the only thing an editor must
-- supply. Continent, page heading and short description were NOT NULL, so the
-- API could not accept a country that had only been named -- the DTO, the
-- service and the column all had to agree before "save a draft with just a
-- name" could work.
--
-- Widening only. Every existing row keeps its value, and the foreign key on
-- continent_id is preserved, so a country that has a continent still cannot
-- point at one that does not exist.
ALTER TABLE `countries` MODIFY `continent_id` CHAR(36) NULL;
ALTER TABLE `countries` MODIFY `page_heading` VARCHAR(255) NULL;
ALTER TABLE `countries` MODIFY `short_description` VARCHAR(1000) NULL;
