import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaderboardQueryDto } from './leaderboard.dto';
import { paginate } from '../../common/utils/helpers';
import { SCORING_WEIGHTS, VerificationStatus } from '@nidhiflow/shared';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStartupLeaderboard(query: LeaderboardQueryDto) {
    const {
      page = 1,
      pageSize = 25,
      sector,
      stage,
      state,
    } = query;

    const where = {
      deletedAt: null,
      isPublished: true,
      ...(sector && { sector }),
      ...(stage && { stage: stage as any }),
      ...(state && { state }),
    };

    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where,
        select: {
          id: true,
          companyName: true,
          tagline: true,
          logoUrl: true,
          sector: true,
          stage: true,
          city: true,
          state: true,
          mrr: true,
          totalUsers: true,
          growthRateMom: true,
          fundingAsk: true,
          leaderboardScore: true,
          leaderboardRank: true,
          previousRank: true,
          profileCompleteness: true,
          verificationStatus: true,
          dpiitNumber: true,
          _count: {
            select: {
              interestsReceived: true,
              updates: true,
            },
          },
        },
        orderBy: [{ leaderboardRank: 'asc' }, { leaderboardScore: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.startup.count({ where }),
    ]);

    return paginate(startups, total, page, pageSize);
  }

  async getInvestorLeaderboard(page = 1, pageSize = 25) {
    const where = {
      deletedAt: null,
      verificationStatus: VerificationStatus.VERIFIED,
    };

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          type: true,
          firmName: true,
          avatarUrl: true,
          sectors: true,
          stagePreference: true,
          ticketSizeMin: true,
          ticketSizeMax: true,
          averageRating: true,
          totalReviews: true,
          leaderboardRank: true,
          previousRank: true,
          verificationStatus: true,
          sebiRegistration: true,
          _count: {
            select: {
              interestsSent: true,
            },
          },
        },
        orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.investor.count({ where }),
    ]);

    return paginate(investors, total, page, pageSize);
  }

  async recomputeAllScores() {
    this.logger.log('Starting full recomputation of leaderboard scores...');

    const startups = await this.prisma.startup.findMany({
      where: { deletedAt: null },
      include: {
        updates: true,
        interestsReceived: true,
        documents: true,
      },
    });

    const scoredStartups = startups.map((startup) => {
      // 1. Traction score (0-100)
      // ₹10 Lakh MRR (10,00,000 * 100 paise) maps to ~75, ₹50L+ to 100
      const mrrRupees = Number(startup.mrr) / 100;
      const tractionScore = Math.min(100, Math.round(Math.sqrt(mrrRupees / 50000) * 100));

      // 2. Growth score (0-100)
      // 30% MoM growth gives ~90-100
      const growthScore = Math.min(100, Math.max(0, Math.round(startup.growthRateMom * 3)));

      // 3. Profile Completeness (0-100)
      const fields = [
        startup.companyName,
        startup.tagline,
        startup.logoUrl,
        startup.sector,
        startup.stage,
        startup.city,
        startup.state,
        startup.foundedYear,
        startup.teamSize,
        startup.website,
        startup.linkedin,
        startup.description,
        startup.problemStatement,
        startup.solution,
        startup.targetMarket,
        startup.businessModel,
        startup.pitchDeckUrl,
        startup.demoVideoUrl,
        startup.companyPan || startup.cin || startup.llpin,
        startup.dpiitNumber,
      ];
      const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
      const profileCompleteness = Math.round((filled / fields.length) * 100);

      // 4. Investor Interest (0-100)
      const interestCount = startup.interestsReceived.length;
      const investorInterestScore = Math.min(100, Math.round((interestCount / 15) * 100));

      // 5. Update consistency (0-100)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const recentUpdates = startup.updates.filter((u) => u.createdAt >= sixMonthsAgo).length;
      const updateScore = Math.min(100, Math.round((recentUpdates / 6) * 100));

      // 6. Transparency / Verification (0-100)
      let transparencyScore = 20;
      if (startup.verificationStatus === VerificationStatus.VERIFIED) {
        transparencyScore = 100;
      } else if (startup.verificationStatus === VerificationStatus.UNDER_REVIEW) {
        transparencyScore = 60;
      }
      if (startup.cin || startup.companyPan) transparencyScore = Math.min(100, transparencyScore + 15);
      if (startup.dpiitNumber) transparencyScore = Math.min(100, transparencyScore + 15);

      // 7. Funds Raised / Committed (0-100)
      const committedTotalPaise = startup.interestsReceived
        .filter((i) => i.status === 'COMMITTED')
        .reduce((sum, i) => sum + Number(i.ticketAmount), 0);
      const fundsScore = committedTotalPaise > 0
        ? Math.min(100, Math.round(Math.log10(committedTotalPaise / 100) * 12))
        : 10;

      // Composite calculation
      const compositeScore = Number(
        (
          SCORING_WEIGHTS.TRACTION * tractionScore +
          SCORING_WEIGHTS.GROWTH * growthScore +
          SCORING_WEIGHTS.PROFILE_COMPLETENESS * profileCompleteness +
          SCORING_WEIGHTS.INVESTOR_INTEREST * investorInterestScore +
          SCORING_WEIGHTS.UPDATE_CONSISTENCY * updateScore +
          SCORING_WEIGHTS.TRANSPARENCY_RATING * transparencyScore +
          SCORING_WEIGHTS.FUNDS_RAISED * fundsScore
        ).toFixed(2),
      );

      return {
        id: startup.id,
        currentRank: startup.leaderboardRank,
        compositeScore,
        profileCompleteness,
      };
    });

    // Sort descending by score
    scoredStartups.sort((a, b) => b.compositeScore - a.compositeScore);

    // Update in database with ranks
    await Promise.all(
      scoredStartups.map((item, index) => {
        const newRank = index + 1;
        return this.prisma.startup.update({
          where: { id: item.id },
          data: {
            leaderboardScore: item.compositeScore,
            profileCompleteness: item.profileCompleteness,
            previousRank: item.currentRank || newRank,
            leaderboardRank: newRank,
          },
        });
      }),
    );

    // Also update investor ranks
    const investors = await this.prisma.investor.findMany({
      where: { deletedAt: null },
      orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
    });

    await Promise.all(
      investors.map((inv, index) => {
        const newRank = index + 1;
        return this.prisma.investor.update({
          where: { id: inv.id },
          data: {
            previousRank: inv.leaderboardRank || newRank,
            leaderboardRank: newRank,
          },
        });
      }),
    );

    this.logger.log(`Recomputed leaderboard for ${scoredStartups.length} startups and ${investors.length} investors`);
    return {
      updatedStartups: scoredStartups.length,
      updatedInvestors: investors.length,
    };
  }
}
