import { IsString, IsOptional, IsInt, Min, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InterestStatus } from '@prisma/client';

export class ExpressInterestDto {
  @ApiProperty({ example: 'startup-uuid-here' })
  @IsString()
  startupId: string;

  @ApiProperty({ description: 'Ticket amount in paise (e.g. 250000000 for ₹25 Lakh)', example: 250000000 })
  @IsInt()
  @Min(10000000) // minimum ₹1,00,000 (100000 * 100 paise)
  ticketAmount: number;

  @ApiPropertyOptional({ example: 'We love your traction in the B2B logistics sector and would like to connect.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class InterestQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ enum: InterestStatus })
  @IsOptional()
  @IsEnum(InterestStatus)
  status?: InterestStatus;
}
