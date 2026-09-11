import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BUDGET_BANDS,
  COST_PERIODS,
  INTAKE_AVAILABILITY,
  LANGUAGE_REQUIREMENTS,
  PATHWAY_STRENGTHS,
  STATISTICS_SOURCE_MODES,
  VISA_SUCCESS_BANDS,
} from './profile.constants';

function trim({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function bool({ value }: TransformFnParams): unknown {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}

function integer({ value }: TransformFnParams): unknown {
  // null has to survive: it is what the serializer returns for an unset
  // column, so an editor that saves what it was given sends it straight back.
  // Number(null) is 0, which @IsOptional() no longer skips and @Min then
  // rejects — that is what made every second profile save fail.
  if (value === undefined || value === null || value === '') return value;
  return Number(value);
}

/**
 * How much authored markup a profile's rich-text field accepts.
 *
 * These fields are edited in the WYSIWYG, which invites the multi-paragraph
 * guidance a destination page is built from, and they are stored in `TEXT`
 * columns that hold about sixty-five thousand bytes. Only the request contract
 * disagreed: tuition and living-cost notes were capped at a thousand characters
 * and the visa and waiver summaries at two thousand, which a single authored
 * section passes without trying. The write came back 400 naming the field, the
 * editor reported it as a failed save, and the author was left with an empty
 * card and no idea which sentence was too long.
 *
 * Ten thousand is what `disclaimer` and `visaInformation` already allowed, so
 * it is the number the contract already considered reasonable for exactly this
 * kind of copy. It stays well inside the column either way.
 *
 * Every rich-text field on these cards now shares it, the four per-test English
 * notes included: their columns were `VARCHAR(500)`, which is not a shape a
 * WYSIWYG field can have, and they were widened to `TEXT` alongside this.
 */
export const RICH_TEXT_MAX = 10000;

export class ProfileVersionDto {
  @ApiPropertyOptional({
    description: 'Timestamp returned by the previous write',
  })
  @Transform(trim)
  @IsOptional()
  @IsISO8601()
  expectedUpdatedAt?: string;
}

export class CreateIntakeDto {
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  name!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @Transform(integer)
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth!: number;

  @Transform(integer)
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth!: number;

  @Transform(trim) @IsOptional() @IsString() @MaxLength(50) seasonName?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(50) shortLabel?: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(30) status?: string;
  @Transform(integer) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateIntakeDto {
  @Transform(trim) @IsOptional() @IsString() @MaxLength(100) name?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(100) slug?: string;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth?: number;
  @Transform(integer) @IsOptional() @IsInt() @Min(1) @Max(12) endMonth?: number;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(50) seasonName?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(50) shortLabel?: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(30) status?: string;
  @Transform(integer) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class CostProfileDto extends ProfileVersionDto {
  @IsOptional() @IsString() @MaxLength(3) currencyCode?: string;
  @IsOptional() @IsString() @MaxLength(10) currencySymbol?: string;
  @IsOptional() @IsString() tuitionMin?: string;
  @IsOptional() @IsString() tuitionMax?: string;
  @IsOptional() @IsIn(COST_PERIODS) tuitionPeriod?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) tuitionNotes?: string;
  @IsOptional() @IsString() livingCostMin?: string;
  @IsOptional() @IsString() livingCostMax?: string;
  @IsOptional() @IsIn(COST_PERIODS) livingCostPeriod?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) livingCostNotes?: string;
  @IsOptional() @IsString() accommodationMin?: string;
  @IsOptional() @IsString() accommodationMax?: string;
  @IsOptional() @IsString() foodCostMin?: string;
  @IsOptional() @IsString() foodCostMax?: string;
  @IsOptional() @IsString() transportCostMin?: string;
  @IsOptional() @IsString() transportCostMax?: string;
  @IsOptional() @IsString() healthInsuranceCost?: string;
  @IsOptional() @IsString() applicationFeeMin?: string;
  @IsOptional() @IsString() applicationFeeMax?: string;
  @IsOptional() @IsIn(BUDGET_BANDS) budgetBand?: string;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  applicableYear?: number;
  @IsOptional() @IsString() @MaxLength(2048) sourceReference?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) disclaimer?: string;
  @IsOptional() @IsISO8601() verifiedAt?: string;
}

export class WorkProfileDto extends ProfileVersionDto {
  @IsOptional() @IsString() @MaxLength(255) visaType?: string;
  @IsOptional() @IsString() visaFee?: string;
  @IsOptional() @IsString() @MaxLength(3) visaFeeCurrencyCode?: string;
  @Transform(bool) @IsOptional() @IsBoolean() partTimeAllowed?: boolean;
  @IsOptional() @IsString() partTimeHoursPerWeek?: string;
  @IsOptional() @IsString() partTimeHoursDuringBreaks?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) partTimeSummary?: string;
  @Transform(bool) @IsOptional() @IsBoolean() postStudyWorkAvailable?: boolean;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  postStudyWorkMinMonths?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  postStudyWorkMaxMonths?: number;
  @IsOptional()
  @IsString()
  @MaxLength(RICH_TEXT_MAX)
  postStudyWorkSummary?: string;
  @IsOptional() @IsIn(PATHWAY_STRENGTHS) immigrationPathwayStrength?: string;
  @IsOptional()
  @IsString()
  @MaxLength(RICH_TEXT_MAX)
  immigrationPathwaySummary?: string;
  @IsOptional() @IsIn(VISA_SUCCESS_BANDS) visaSuccessBand?: string;
  @IsOptional() @IsString() visaSuccessPercentage?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) visaInformation?: string;
  @IsOptional() @IsString() @MaxLength(255) visaProcessingTime?: string;
  @IsOptional()
  @IsString()
  @MaxLength(RICH_TEXT_MAX)
  proofOfFundsSummary?: string;
  @IsOptional() @IsString() @MaxLength(2048) sourceReference?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) disclaimer?: string;
  @IsOptional() @IsISO8601() verifiedAt?: string;
}

export class LanguageProfileDto extends ProfileVersionDto {
  @IsOptional() @IsIn(LANGUAGE_REQUIREMENTS) ieltsRequirement?: string;
  @IsOptional() @IsString() ieltsMinScore?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) ieltsNotes?: string;
  @IsOptional() @IsIn(LANGUAGE_REQUIREMENTS) pteRequirement?: string;
  @IsOptional() @IsString() pteMinScore?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) pteNotes?: string;
  @IsOptional() @IsIn(LANGUAGE_REQUIREMENTS) toeflRequirement?: string;
  @IsOptional() @IsString() toeflMinScore?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) toeflNotes?: string;
  @IsOptional() @IsIn(LANGUAGE_REQUIREMENTS) duolingoRequirement?: string;
  @IsOptional() @IsString() duolingoMinScore?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) duolingoNotes?: string;
  @Transform(bool) @IsOptional() @IsBoolean() languageWaiverAvailable?: boolean;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) waiverNotes?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) generalNotes?: string;
  @IsOptional() @IsString() @MaxLength(2048) sourceReference?: string;
  @IsOptional() @IsString() @MaxLength(RICH_TEXT_MAX) disclaimer?: string;
  @IsOptional() @IsISO8601() verifiedAt?: string;
}

export class CountryIntakeItemDto {
  @IsUUID() intakeId!: string;
  @Transform(bool) @IsOptional() @IsBoolean() isMajor?: boolean;
  @IsOptional() @IsIn(INTAKE_AVAILABILITY) availabilityStatus?: string;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  applicationOpeningMonth?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  applicationDeadlineMonth?: number;
  /* Both notes are authored in the WYSIWYG alongside `notes`, so they carry
   * the same markup and need the same room for it. */
  @IsOptional() @IsString() @MaxLength(2000) applicationOpeningNote?: string;
  @IsOptional() @IsString() @MaxLength(2000) applicationDeadlineNote?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  displayOrder?: number;
}

export class ReplaceIntakesDto extends ProfileVersionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryIntakeItemDto)
  intakes!: CountryIntakeItemDto[];
}

export class StatisticsProfileDto extends ProfileVersionDto {
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  universitiesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  publicUniversitiesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  privateUniversitiesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  coursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  ugCoursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  pgCoursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  pgdmCoursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  mbaCoursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  phdCoursesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  scholarshipsCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  citiesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  topRankedUniversitiesCount?: number;
  @Transform(integer)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  internationalStudentsCount?: number;
  @IsOptional() @IsString() studentSatisfactionPercentage?: string;
  @IsOptional() @IsIn(STATISTICS_SOURCE_MODES) sourceMode?: string;
  @IsOptional() @IsString() @MaxLength(2048) sourceReference?: string;
  @IsOptional() @IsISO8601() verifiedAt?: string;
}
