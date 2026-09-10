import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/auth.decorators';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { successEnvelope } from '../catalog/catalog.responses';
import { CountryTaxonomyService } from './country-taxonomy.service';

/** Only the name is accepted. The code is derived from it upstream, so two
 * operators naming the same thing land on the same row rather than minting two
 * codes that mean the same and both reach the public side. */
class CreateCountryTaxonomyDto {
  @ApiProperty({ example: 'Scholarship friendly' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    required: false,
    description: 'Derived from the name if omitted',
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;
}

/**
 * The reusable Country taxonomies. Adding a feature or an accepted English test
 * here makes it available to every Country, which is the point: these were
 * hard-coded lists, so the only way to add one was a release.
 */
@ApiTags('Admin Countries')
@Controller('admin/country-features')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminCountryFeaturesController {
  constructor(private readonly taxonomy: CountryTaxonomyService) {}

  @Get()
  @ApiOperation({ summary: 'List the reusable country features' })
  async list(@Req() req: AuthenticatedRequest) {
    return successEnvelope(req, await this.taxonomy.options('feature'));
  }

  @Post()
  @ApiOperation({ summary: 'Add a reusable country feature' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateCountryTaxonomyDto,
  ) {
    return successEnvelope(req, await this.taxonomy.create('feature', body));
  }
}

@ApiTags('Admin Countries')
@Controller('admin/country-english-tests')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminCountryEnglishTestsController {
  constructor(private readonly taxonomy: CountryTaxonomyService) {}

  @Get()
  @ApiOperation({ summary: 'List the reusable accepted English tests' })
  async list(@Req() req: AuthenticatedRequest) {
    return successEnvelope(req, await this.taxonomy.options('englishTest'));
  }

  @Post()
  @ApiOperation({ summary: 'Add a reusable accepted English test' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateCountryTaxonomyDto,
  ) {
    return successEnvelope(
      req,
      await this.taxonomy.create('englishTest', body),
    );
  }
}
