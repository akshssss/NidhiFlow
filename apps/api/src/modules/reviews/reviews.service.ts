import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import {
  CreateReviewDto, ReplyReviewDto, ReportReviewDto, ModerateReviewDto,
} from './reviews.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createReview(startupUserId: string, dto: CreateReviewDto) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId: startupUserId },
    });
    if (!startup) throw new NotFoundException('Startup profile not found');

    const interest = await this.prisma.interest.findUnique({
      where: { id: dto.interestId },
      include: { investor: true },
    });
    if (!interest) throw new NotFoundException('Deal connection not found');
    if (interest.startupId !== startup.id) {
      throw new ForbiddenException('You can only review investors you have interacted with');
    }

    const overallScore = Number(
      (
        (dto.responsiveness +
          dto.transparency +
          dto.founderFriendliness +
          dto.valueAdd +
          dto.followThrough +
          dto.decisionSpeed) /
        6
      ).toFixed(2),
    );

    const review = await this.prisma.review.upsert({
      where: { interestId: interest.id },
      create: {
        interestId: interest.id,
        investorId: interest.investorId,
        startupId: startup.id,
        responsiveness: dto.responsiveness,
        transparency: dto.transparency,
        founderFriendliness: dto.founderFriendliness,
        valueAdd: dto.valueAdd,
        followThrough: dto.followThrough,
        decisionSpeed: dto.decisionSpeed,
        overallScore,
        comment: dto.comment,
      },
      update: {
        responsiveness: dto.responsiveness,
        transparency: dto.transparency,
        founderFriendliness: dto.founderFriendliness,
        valueAdd: dto.valueAdd,
        followThrough: dto.followThrough,
        decisionSpeed: dto.decisionSpeed,
        overallScore,
        comment: dto.comment,
      },
    });

    // Recompute investor rating
    await this.recalculateInvestorRating(interest.investorId);

    // Notify investor
    await this.prisma.notification.create({
      data: {
        userId: interest.investor.userId,
        type: NotificationType.REVIEW_RECEIVED,
        title: `New Review from ${startup.companyName}`,
        body: `${startup.companyName} submitted a ${overallScore}★ review of your interaction.`,
        data: { reviewId: review.id, rating: overallScore },
      },
    });

    return review;
  }

  async getInvestorReviews(investorId: string, page = 1, pageSize = 20) {
    const where = { investorId, isHidden: false };
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          startup: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              sector: true,
              stage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async replyToReview(investorUserId: string, reviewId: string, dto: ReplyReviewDto) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: investorUserId },
    });
    if (!investor) throw new NotFoundException('Investor not found');

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { startup: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.investorId !== investor.id) {
      throw new ForbiddenException('You can only reply to reviews on your own profile');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        investorReply: dto.reply,
        investorRepliedAt: new Date(),
      },
    });

    // Notify founder
    await this.prisma.notification.create({
      data: {
        userId: review.startup.userId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: `${investor.displayName} replied to your review`,
        body: dto.reply.slice(0, 100),
        data: { reviewId },
      },
    });

    return updated;
  }

  async reportReview(reviewId: string, dto: ReportReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isReported: true,
        reportReason: dto.reason,
      },
    });
  }

  async moderateReview(reviewId: string, dto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isHidden: dto.isHidden,
        isModerated: true,
      },
    });

    await this.recalculateInvestorRating(review.investorId);

    return updated;
  }

  private async recalculateInvestorRating(investorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { investorId, isHidden: false },
      select: { overallScore: true },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.overallScore, 0) / totalReviews).toFixed(2))
        : 0;

    await this.prisma.investor.update({
      where: { id: investorId },
      data: {
        averageRating,
        totalReviews,
      },
    });
  }
}
