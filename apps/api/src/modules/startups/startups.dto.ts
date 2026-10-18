import {
  IsString, IsOptional, IsNumber, IsBoolean, IsInt,
  Min, Max, IsEnum, IsUrl, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStartupDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sector?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() foundedYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() teamSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) problemStatement?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) solution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) targetMarket?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) businessModel?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) mrr?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) totalUsers?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() growthRateMom?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) fundingAsk?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) equityOffered?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) useOfFunds?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pitchDeckUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() demoVideoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() llpin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyPan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dpiitNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class StartupQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sector?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() minAsk?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() maxAsk?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() verifiedOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: string;
}

export class CreateUpdateDto {
  @ApiProperty() @IsString() @MinLength(2) title: string;
  @ApiProperty() @IsString() @MinLength(10) content: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
}
