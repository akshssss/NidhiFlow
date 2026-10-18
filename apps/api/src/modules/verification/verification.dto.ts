import { IsString, IsOptional, IsEnum, IsArray, IsUrl, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';

export class SubmitStartupVerificationDto {
  @ApiPropertyOptional({ example: 'U72200MH2019PTC123456' })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional({ example: 'AAA-1234' })
  @IsOptional()
  @IsString()
  llpin?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  companyPan?: string;

  @ApiPropertyOptional({ example: 'DIPP12345' })
  @IsOptional()
  @IsString()
  dpiitNumber?: string;

  @ApiPropertyOptional({ example: '27AAPFU0939F1ZV' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  founderIdProofUrl?: string;
}

export class SubmitInvestorVerificationDto {
  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional({ example: 'IN/AIF2/12-34/5678' })
  @IsOptional()
  @IsString()
  sebiRegistration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  netWorthDeclaration?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  accreditedInvestor?: boolean;
}

export class ReviewVerificationDto {
  @ApiProperty({ enum: VerificationStatus })
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
