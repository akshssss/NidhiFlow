import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { paginate } from '../../common/utils/helpers';
import { UpdateStartupDto, StartupQueryDto, CreateUpdateDto } from './startups.dto';

@Injectable()
export class StartupsService {
  private readonly logger = new Logger(StartupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: StartupQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      sector,
      stage,
      state,
      minAsk,
      maxAsk,
      verifiedOnly,
      search,
      sortBy = 'leaderboardScore',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.StartupWhereInput = {
      deletedAt: null,
      isPublished: true,
      ...(sector && { sector }),
      ...(stage && { stage: stage as any }),
      ...(state && { state }),
      ...(verifiedOnly && { verificationStatus: 'VERIFIED' }),
      ...(minAsk && { fundingAsk: { gte: BigInt(minAsk) } }),
      ...(maxAsk && { fundingAsk: { lte: BigInt(maxAsk) } }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' as const } },
          { tagline: { contains: search, mode: 'insensitive' as const } },
          { sector: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { interestsReceived: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.startup.count({ where }),
    ]);

    return paginate(startups, total, page, pageSize);
  }

  async findById(id: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: { select: { name: true, email: true } },
        teamMembers: true,
        milestones: { orderBy: { date: 'desc' } },
        updates: { where: { isPublic: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        tractionHistory: { orderBy: { recordedAt: 'desc' }, take: 12 },
        _count: { select: { interestsReceived: true } },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    // Increment profile views
    await this.prisma.startup.update({
      where: { id },
      data: { profileViews: { increment: 1 } },
    });

    return startup;
  }

  async findByUserId(userId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        teamMembers: true,
        milestones: { orderBy: { date: 'desc' } },
        documents: true,
        tractionHistory: { orderBy: { recordedAt: 'desc' }, take: 12 },
        _count: { select: { interestsReceived: true } },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup profile not found');
    }

    return startup;
  }

  async update(userId: string, dto: UpdateStartupDto) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
    });

    if (!startup) {
      throw new NotFoundException('Startup profile not found');
    }

    // Calculate profile completeness
    const completeness = this.calculateProfileCompleteness({ ...startup, ...dto });

    const updated = await this.prisma.startup.update({
      where: { userId },
      data: {
        ...dto,
        stage: dto.stage ? (dto.stage as any) : undefined,
        profileCompleteness: completeness,
      },
      include: {
        user: { select: { name: true, email: true } },
        teamMembers: true,
        milestones: true,
      },
    });

    return updated;
  }

  async getDashboard(userId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            interestsReceived: true,
            updates: true,
          },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    const [
      totalInterests,
      pendingInterests,
      committedInterests,
      unreadMessages,
      recentInterests,
    ] = await Promise.all([
      this.prisma.interest.count({ where: { startupId: startup.id } }),
      this.prisma.interest.count({ where: { startupId: startup.id, status: 'EXPRESSED' } }),
      this.prisma.interest.count({ where: { startupId: startup.id, status: 'COMMITTED' } }),
      this.prisma.chatMessage.count({
        where: {
          chatRoom: {
            interest: { startupId: startup.id },
          },
          isRead: false,
          senderId: { not: userId },
        },
      }),
      this.prisma.interest.findMany({
        where: { startupId: startup.id },
        include: {
          investor: {
            select: { displayName: true, firmName: true, type: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate total committed amount
    const committedAmount = await this.prisma.interest.aggregate({
      where: { startupId: startup.id, status: 'COMMITTED' },
      _sum: { ticketAmount: true },
    });

    return {
      startup,
      stats: {
        profileViews: startup.profileViews,
        totalInterests,
        pendingInterests,
        committedInterests,
        unreadMessages,
        totalCommitted: committedAmount._sum.ticketAmount || 0,
        fundingProgress: startup.fundingAsk
          ? Math.min(
              100,
              (Number(committedAmount._sum.ticketAmount || 0) / Number(startup.fundingAsk)) * 100,
            )
          : 0,
        leaderboardRank: startup.leaderboardRank,
        leaderboardScore: startup.leaderboardScore,
      },
      recentInterests,
    };
  }

  async createUpdate(userId: string, dto: CreateUpdateDto) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return this.prisma.startupUpdate.create({
      data: {
        startupId: startup.id,
        title: dto.title,
        content: dto.content,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async getUpdates(startupId: string, page = 1, pageSize = 10) {
    const [updates, total] = await Promise.all([
      this.prisma.startupUpdate.findMany({
        where: { startupId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.startupUpdate.count({ where: { startupId } }),
    ]);

    return paginate(updates, total, page, pageSize);
  }

  private calculateProfileCompleteness(data: any): number {
    const fields = [
      'companyName', 'tagline', 'sector', 'stage', 'city', 'state',
      'foundedYear', 'description', 'problemStatement', 'solution',
      'targetMarket', 'businessModel', 'mrr', 'totalUsers',
      'growthRateMom', 'fundingAsk', 'equityOffered', 'useOfFunds',
      'website', 'linkedin', 'pitchDeckUrl', 'cin', 'companyPan',
    ];

    const filled = fields.filter((f) => {
      const val = data[f];
      return val !== null && val !== undefined && val !== '' && val !== 0;
    }).length;

    return Math.round((filled / fields.length) * 100);
  }
}
