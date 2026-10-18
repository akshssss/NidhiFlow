import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto, ReplyReviewDto, ReportReviewDto, ModerateReviewDto,
} from './reviews.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit 6-dimensional review for an investor' })
  async createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('investor/:investorId')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'List public reviews for an investor' })
  async getInvestorReviews(
    @Param('investorId') investorId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reviewsService.getInvestorReviews(investorId, page, pageSize);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Investor response to a review' })
  async replyToReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.replyToReview(userId, reviewId, dto);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a review for moderation' })
  async reportReview(
    @Param('id') reviewId: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(reviewId, dto);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin moderate/hide a review' })
  async moderateReview(
    @Param('id') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewsService.moderateReview(reviewId, dto);
  }
}
