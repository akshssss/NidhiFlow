import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationStatus, NotificationType } from '@prisma/client';
import {
  SubmitStartupVerificationDto,
  SubmitInvestorVerificationDto,
  ReviewVerificationDto,
} from './verification.dto';
import {
  cinSchema,
  panSchema,
  gstinSchema,
  dpiitSchema,
  llpinSchema,
} from '@nidhiflow/shared';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitStartupVerification(userId: string, dto: SubmitStartupVerificationDto) {
    const startup = await this.prisma.startup.findUnique({ where: { userId } });
    if (!startup) throw new NotFoundException('Startup profile not found');

    // Validate formats if provided
    if (dto.cin) {
      const cinCheck = cinSchema.safeParse(dto.cin);
      if (!cinCheck.success) {
        throw new BadRequestException('Invalid Corporate Identification Number (CIN) format');
      }
    }
    if (dto.companyPan) {
      const panCheck = panSchema.safeParse(dto.companyPan);
      if (!panCheck.success) {
        throw new BadRequestException('Invalid Company PAN format');
      }
    }
    if (dto.gstin) {
      const gstinCheck = gstinSchema.safeParse(dto.gstin);
      if (!gstinCheck.success) {
        throw new BadRequestException('Invalid GSTIN format');
      }
    }
    if (dto.dpiitNumber) {
      const dpiitCheck = dpiitSchema.safeParse(dto.dpiitNumber);
      if (!dpiitCheck.success) {
        throw new BadRequestException('Invalid DPIIT number format');
      }
    }
    if (dto.llpin) {
      const llpinCheck = llpinSchema.safeParse(dto.llpin);
      if (!llpinCheck.success) {
        throw new BadRequestException('Invalid LLPIN format');
      }
    }

    const updated = await this.prisma.startup.update({
      where: { id: startup.id },
      data: {
        ...dto,
        verificationStatus: VerificationStatus.UNDER_REVIEW,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBMIT_STARTUP_VERIFICATION',
        entityType: 'Startup',
        entityId: startup.id,
        details: { submittedFields: Object.keys(dto) },
      },
    });

    return updated;
  }

  async submitInvestorVerification(userId: string, dto: SubmitInvestorVerificationDto) {
    const investor = await this.prisma.investor.findUnique({ where: { userId } });
    if (!investor) throw new NotFoundException('Investor profile not found');

    if (dto.pan) {
      const panCheck = panSchema.safeParse(dto.pan);
      if (!panCheck.success) {
        throw new BadRequestException('Invalid PAN format');
      }
    }

    const updated = await this.prisma.investor.update({
      where: { id: investor.id },
      data: {
        ...dto,
        verificationStatus: VerificationStatus.UNDER_REVIEW,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBMIT_INVESTOR_VERIFICATION',
        entityType: 'Investor',
        entityId: investor.id,
        details: { submittedFields: Object.keys(dto) },
      },
    });

    return updated;
  }

  async getPendingQueue() {
    const [startups, investors] = await Promise.all([
      this.prisma.startup.findMany({
        where: {
          verificationStatus: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW] },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          documents: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.investor.findMany({
        where: {
          verificationStatus: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW] },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          documents: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { startups, investors };
  }

  async reviewStartup(startupId: string, adminUserId: string, dto: ReviewVerificationDto) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      include: { user: true },
    });
    if (!startup) throw new NotFoundException('Startup not found');

    const updated = await this.prisma.startup.update({
      where: { id: startupId },
      data: {
        verificationStatus: dto.status,
        verificationNote: dto.note || null,
        verifiedAt: dto.status === VerificationStatus.VERIFIED ? new Date() : null,
      },
    });

    // Notify founder
    await this.prisma.notification.create({
      data: {
        userId: startup.userId,
        type: NotificationType.VERIFICATION_UPDATE,
        title: dto.status === VerificationStatus.VERIFIED ? 'Verification Approved!' : 'Verification Update',
        body: dto.status === VerificationStatus.VERIFIED
          ? 'Congratulations! Your startup profile has been verified with a blue badge.'
          : `Your verification status has been updated to ${dto.status}. Note: ${dto.note || 'None'}`,
        data: { startupId, status: dto.status, note: dto.note },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `REVIEW_STARTUP_${dto.status}`,
        entityType: 'Startup',
        entityId: startupId,
        details: { status: dto.status, note: dto.note },
      },
    });

    return updated;
  }

  async reviewInvestor(investorId: string, adminUserId: string, dto: ReviewVerificationDto) {
    const investor = await this.prisma.investor.findUnique({
      where: { id: investorId },
      include: { user: true },
    });
    if (!investor) throw new NotFoundException('Investor not found');

    const updated = await this.prisma.investor.update({
      where: { id: investorId },
      data: {
        verificationStatus: dto.status,
        verificationNote: dto.note || null,
        verifiedAt: dto.status === VerificationStatus.VERIFIED ? new Date() : null,
      },
    });

    // Notify investor
    await this.prisma.notification.create({
      data: {
        userId: investor.userId,
        type: NotificationType.VERIFICATION_UPDATE,
        title: dto.status === VerificationStatus.VERIFIED ? 'Investor Verification Approved!' : 'Verification Update',
        body: dto.status === VerificationStatus.VERIFIED
          ? 'Your investor credentials have been verified. You now have verified deal access.'
          : `Your verification status has been updated to ${dto.status}. Note: ${dto.note || 'None'}`,
        data: { investorId, status: dto.status, note: dto.note },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `REVIEW_INVESTOR_${dto.status}`,
        entityType: 'Investor',
        entityId: investorId,
        details: { status: dto.status, note: dto.note },
      },
    });

    return updated;
  }
}
