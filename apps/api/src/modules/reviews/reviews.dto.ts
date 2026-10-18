import {
  IsString, IsInt, Min, Max, MinLength, MaxLength, IsOptional, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the connection/interest deal' })
  @IsString()
  interestId: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  responsiveness: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  transparency: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  founderFriendliness: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  valueAdd: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  followThrough: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  decisionSpeed: number;

  @ApiProperty({
    description: 'Detailed feedback from founder',
    example: 'Exceptional transparency and fast due diligence process. Provided real strategic intros.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  comment: string;
}

export class ReplyReviewDto {
  @ApiProperty({
    description: 'Investor response to review',
    example: 'Thank you for the kind words! Thrilled to partner with your team.',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reply: string;
}

export class ReportReviewDto {
  @ApiProperty({ example: 'Review contains false allegations or harassment' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;
}

export class ModerateReviewDto {
  @ApiProperty()
  @IsBoolean()
  isHidden: boolean;
}
