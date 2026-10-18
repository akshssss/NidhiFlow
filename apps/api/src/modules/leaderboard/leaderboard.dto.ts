import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LeaderboardQueryDto {
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
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ example: 'Fintech' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 'SEED' })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({ example: 'Karnataka' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'all' })
  @IsOptional()
  @IsString()
  timeframe?: 'all' | 'month' | 'quarter';
}
