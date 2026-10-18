import {
  IsString, IsOptional, IsNumber, IsBoolean, IsInt,
  Min, Max, IsEnum, IsArray, IsUrl, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InvestorType } from '@prisma/client';

export class UpdateInvestorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;
  @ApiPropertyOptional({ enum: InvestorType }) @IsOptional() @IsEnum(InvestorType) type?: InvestorType;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) firmName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) bio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) thesis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() avatarUrl?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) sectors?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) stagePreference?: string[];
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) ticketSizeMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) ticketSizeMax?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) geographyPreference?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) pastInvestments?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sebiRegistration?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() netWorthDeclaration?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() accreditedInvestor?: boolean;
}

export class InvestorQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ enum: InvestorType }) @IsOptional() @IsEnum(InvestorType) type?: InvestorType;
  @ApiPropertyOptional() @IsOptional() @IsString() sector?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() verifiedOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
