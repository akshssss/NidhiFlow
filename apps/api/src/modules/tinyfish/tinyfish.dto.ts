import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class TinyFishSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class TinyFishFetchDto {
  @IsArray()
  @IsNotEmpty()
  urls: string[];

  @IsOptional()
  @IsString()
  format?: 'markdown' | 'json' | 'html';

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class TinyFishRunAgentDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  goal: string;
}

export class TinyFishDueDiligenceDto {
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

export class TinyFishEnrichUrlDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class TinyFishAskAgentDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}
