import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminUserQueryDto } from './admin.dto';
import { paginate } from '../../common/utils/helpers';
import { VerificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalStartups,
      totalInvestors,
      pendingStartupVerifications,
      pendingInvestorVerifications,
      totalInterests,
      committedInterests,
      reportedReviews,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.startup.count({ where: { deletedAt: null } }),
      this.prisma.investor.count({ where: { deletedAt: null } }),
      this.prisma.startup.count({
        where: {
          verificationStatus: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW] },
          deletedAt: null,
        },
      }),
      this.prisma.investor.count({
        where: {
          verificationStatus: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW] },
          deletedAt: null,
        },
      }),
      this.prisma.interest.count(),
      this.prisma.interest.findMany({
        where: { status: 'COMMITTED' },
        select: { ticketAmount: true },
      }),
      this.prisma.review.count({ where: { isReported: true, isHidden: false } }),
      this.prisma.auditLog.findMany({
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalCommittedValuePaise = committedInterests.reduce(
      (sum, item) => sum + Number(item.ticketAmount),
      0,
    );

    return {
      totalUsers,
      totalStartups,
      totalInvestors,
      pendingVerifications: {
        startups: pendingStartupVerifications,
        investors: pendingInvestorVerifications,
        total: pendingStartupVerifications + pendingInvestorVerifications,
      },
      dealFlow: {
        totalInterests,
        committedCount: committedInterests.length,
        totalCommittedValue: totalCommittedValuePaise,
      },
      moderation: {
        reportedReviews,
      },
      recentAuditLogs,
    };
  }

  async getUsers(query: AdminUserQueryDto) {
    const { page = 1, pageSize = 20, role, search } = query;
    const where = {
      deletedAt: null,
      ...(role && { role: role as UserRole }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          startup: {
            select: { id: true, companyName: true, verificationStatus: true },
          },
          investor: {
            select: { id: true, displayName: true, verificationStatus: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(users, total, page, pageSize);
  }

  async toggleUserActive(userId: string, adminUserId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entityType: 'User',
        entityId: userId,
        details: { targetEmail: user.email },
      },
    });

    return updated;
  }

  async getReportedReviews(page = 1, pageSize = 20) {
    const where = { isReported: true };
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          startup: { select: { id: true, companyName: true } },
          investor: { select: { id: true, displayName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return paginate(reviews, total, page, pageSize);
  }

  async getAuditLogs(page = 1, pageSize = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count(),
    ]);

    return paginate(logs, total, page, pageSize);
  }
}
