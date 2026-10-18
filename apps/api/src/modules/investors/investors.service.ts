import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { paginate } from '../../common/utils/helpers';
import { UpdateInvestorDto, InvestorQueryDto } from './investors.dto';

@Injectable()
export class InvestorsService {
  private readonly logger = new Logger(InvestorsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: InvestorQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      type,
      sector,
      verifiedOnly,
      search,
      sortBy = 'averageRating',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.InvestorWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(verifiedOnly && { verificationStatus: 'VERIFIED' }),
      ...(sector && { sectors: { has: sector } }),
      ...(search && {
        OR: [
          { displayName: { contains: search, mode: 'insensitive' as const } },
          { firmName: { contains: search, mode: 'insensitive' as const } },
          { bio: { contains: search, mode: 'insensitive' as const } },
          { thesis: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        include: {
          user: { select: { name: true } },
          _count: { select: { interestsSent: true, reviewsReceived: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.investor.count({ where }),
    ]);

    return paginate(investors, total, page, pageSize);
  }

  async findById(id: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: { select: { name: true } },
        reviewsReceived: {
          where: { isHidden: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            startup: { select: { companyName: true, logoUrl: true, sector: true } },
          },
        },
        _count: { select: { interestsSent: true, reviewsReceived: true } },
      },
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return investor;
  }

  async findByUserId(userId: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        documents: true,
        _count: { select: { interestsSent: true, reviewsReceived: true } },
      },
    });

    if (!investor) {
      throw new NotFoundException('Investor profile not found');
    }

    return investor;
  }

  async update(userId: string, dto: UpdateInvestorDto) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
    });

    if (!investor) {
      throw new NotFoundException('Investor profile not found');
    }

    return this.prisma.investor.update({
      where: { userId },
      data: dto,
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async getDashboard(userId: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    const [
      totalInterests,
      acceptedInterests,
      committedDeals,
      savedStartups,
      unreadMessages,
      recentInterests,
      portfolio,
    ] = await Promise.all([
      this.prisma.interest.count({ where: { investorId: investor.id } }),
      this.prisma.interest.count({ where: { investorId: investor.id, status: 'ACCEPTED' } }),
      this.prisma.interest.count({ where: { investorId: investor.id, status: 'COMMITTED' } }),
      this.prisma.savedStartup.count({ where: { investorId: investor.id } }),
      this.prisma.chatMessage.count({
        where: {
          chatRoom: {
            interest: { investorId: investor.id },
          },
          isRead: false,
          senderId: { not: userId },
        },
      }),
      this.prisma.interest.findMany({
        where: { investorId: investor.id },
        include: {
          startup: {
            select: {
              id: true, companyName: true, sector: true, stage: true,
              city: true, state: true, fundingAsk: true, mrr: true,
              verificationStatus: true, logoUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.interest.findMany({
        where: { investorId: investor.id, status: 'COMMITTED' },
        include: {
          startup: {
            select: {
              id: true, companyName: true, sector: true, stage: true,
              mrr: true, totalUsers: true, growthRateMom: true,
              verificationStatus: true, logoUrl: true,
            },
          },
        },
      }),
    ]);

    const totalDeployed = await this.prisma.interest.aggregate({
      where: { investorId: investor.id, status: 'COMMITTED' },
      _sum: { ticketAmount: true },
    });

    return {
      investor,
      stats: {
        totalInterests,
        acceptedInterests,
        committedDeals,
        savedStartups,
        unreadMessages,
        totalDeployed: totalDeployed._sum.ticketAmount || 0,
        averageRating: investor.averageRating,
        totalReviews: investor.totalReviews,
        leaderboardRank: investor.leaderboardRank,
      },
      recentInterests,
      portfolio,
    };
  }

  async getSavedStartups(userId: string, page = 1, pageSize = 20) {
    const investor = await this.prisma.investor.findUnique({ where: { userId } });
    if (!investor) throw new NotFoundException('Investor not found');

    const [saved, total] = await Promise.all([
      this.prisma.savedStartup.findMany({
        where: { investorId: investor.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.savedStartup.count({ where: { investorId: investor.id } }),
    ]);

    // Fetch startup details for saved items
    const startupIds = saved.map(s => s.startupId);
    const startups = await this.prisma.startup.findMany({
      where: { id: { in: startupIds } },
      include: { user: { select: { name: true } } },
    });

    return paginate(startups, total, page, pageSize);
  }

  async saveStartup(userId: string, startupId: string) {
    const investor = await this.prisma.investor.findUnique({ where: { userId } });
    if (!investor) throw new NotFoundException('Investor not found');

    const startup = await this.prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) throw new NotFoundException('Startup not found');

    return this.prisma.savedStartup.upsert({
      where: {
        investorId_startupId: {
          investorId: investor.id,
          startupId,
        },
      },
      create: { investorId: investor.id, startupId },
      update: {},
    });
  }

  async unsaveStartup(userId: string, startupId: string) {
    const investor = await this.prisma.investor.findUnique({ where: { userId } });
    if (!investor) throw new NotFoundException('Investor not found');

    return this.prisma.savedStartup.deleteMany({
      where: { investorId: investor.id, startupId },
    });
  }
}
