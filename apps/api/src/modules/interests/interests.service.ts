import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InterestStatus, NotificationType } from '@prisma/client';
import { ExpressInterestDto, InterestQueryDto } from './interests.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async expressInterest(investorUserId: string, dto: ExpressInterestDto) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: investorUserId },
      include: { user: true },
    });
    if (!investor) throw new NotFoundException('Investor profile not found');

    const startup = await this.prisma.startup.findUnique({
      where: { id: dto.startupId, deletedAt: null },
      include: { user: true },
    });
    if (!startup) throw new NotFoundException('Startup not found');

    // Create or update interest
    const interest = await this.prisma.interest.upsert({
      where: {
        investorId_startupId: {
          investorId: investor.id,
          startupId: startup.id,
        },
      },
      create: {
        investorId: investor.id,
        startupId: startup.id,
        ticketAmount: dto.ticketAmount,
        message: dto.message || null,
        status: InterestStatus.EXPRESSED,
      },
      update: {
        ticketAmount: dto.ticketAmount,
        message: dto.message || null,
        status: InterestStatus.EXPRESSED,
      },
    });

    // Ensure chat room exists
    let chatRoom = await this.prisma.chatRoom.findUnique({
      where: { interestId: interest.id },
    });

    if (!chatRoom) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          interestId: interest.id,
          members: {
            create: [
              { userId: investorUserId },
              { userId: startup.userId },
            ],
          },
        },
      });
    }

    // If message provided, post into chat room
    if (dto.message) {
      await this.prisma.chatMessage.create({
        data: {
          chatRoomId: chatRoom.id,
          senderId: investorUserId,
          content: dto.message,
        },
      });
    }

    // Send notification to startup
    await this.prisma.notification.create({
      data: {
        userId: startup.userId,
        type: NotificationType.INTEREST_RECEIVED,
        title: `New Interest from ${investor.displayName}`,
        body: `${investor.displayName} expressed investment interest of ₹${(dto.ticketAmount / 10000000).toFixed(2)} Lakh.`,
        data: { interestId: interest.id, investorId: investor.id, startupId: startup.id },
      },
    });

    return { interest, chatRoomId: chatRoom.id };
  }

  async getReceivedInterests(startupUserId: string, query: InterestQueryDto) {
    const startup = await this.prisma.startup.findUnique({ where: { userId: startupUserId } });
    if (!startup) throw new NotFoundException('Startup profile not found');

    const { page = 1, pageSize = 20, status } = query;
    const where = {
      startupId: startup.id,
      ...(status && { status }),
    };

    const [interests, total] = await Promise.all([
      this.prisma.interest.findMany({
        where,
        include: {
          investor: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          chatRoom: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.interest.count({ where }),
    ]);

    return paginate(interests, total, page, pageSize);
  }

  async getSentInterests(investorUserId: string, query: InterestQueryDto) {
    const investor = await this.prisma.investor.findUnique({ where: { userId: investorUserId } });
    if (!investor) throw new NotFoundException('Investor profile not found');

    const { page = 1, pageSize = 20, status } = query;
    const where = {
      investorId: investor.id,
      ...(status && { status }),
    };

    const [interests, total] = await Promise.all([
      this.prisma.interest.findMany({
        where,
        include: {
          startup: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          chatRoom: { select: { id: true } },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.interest.count({ where }),
    ]);

    return paginate(interests, total, page, pageSize);
  }

  async getInterestById(userId: string, id: string) {
    const interest = await this.prisma.interest.findUnique({
      where: { id },
      include: {
        startup: { include: { user: { select: { id: true, name: true, email: true } } } },
        investor: { include: { user: { select: { id: true, name: true, email: true } } } },
        chatRoom: { select: { id: true } },
        review: true,
      },
    });

    if (!interest) throw new NotFoundException('Interest record not found');

    if (interest.startup.userId !== userId && interest.investor.userId !== userId) {
      throw new ForbiddenException('Access denied to this interest deal');
    }

    return interest;
  }

  async acceptInterest(startupUserId: string, id: string) {
    const startup = await this.prisma.startup.findUnique({ where: { userId: startupUserId } });
    if (!startup) throw new NotFoundException('Startup not found');

    const interest = await this.prisma.interest.findUnique({
      where: { id },
      include: { investor: true },
    });
    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.startupId !== startup.id) {
      throw new ForbiddenException('You cannot accept an interest for another startup');
    }

    const updated = await this.prisma.interest.update({
      where: { id },
      data: { status: InterestStatus.ACCEPTED },
    });

    await this.prisma.notification.create({
      data: {
        userId: interest.investor.userId,
        type: NotificationType.INTEREST_ACCEPTED,
        title: `${startup.companyName} accepted your interest!`,
        body: 'You can now message directly and collaborate inside the deal room.',
        data: { interestId: id, startupId: startup.id },
      },
    });

    return updated;
  }

  async declineInterest(startupUserId: string, id: string) {
    const startup = await this.prisma.startup.findUnique({ where: { userId: startupUserId } });
    if (!startup) throw new NotFoundException('Startup not found');

    const interest = await this.prisma.interest.findUnique({
      where: { id },
      include: { investor: true },
    });
    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.startupId !== startup.id) {
      throw new ForbiddenException('Unauthorized');
    }

    const updated = await this.prisma.interest.update({
      where: { id },
      data: { status: InterestStatus.DECLINED },
    });

    await this.prisma.notification.create({
      data: {
        userId: interest.investor.userId,
        type: NotificationType.INTEREST_DECLINED,
        title: `${startup.companyName} declined your interest`,
        body: 'The founders are not currently pursuing this opportunity.',
        data: { interestId: id, startupId: startup.id },
      },
    });

    return updated;
  }

  async confirmCommitment(userId: string, id: string) {
    const interest = await this.prisma.interest.findUnique({
      where: { id },
      include: {
        startup: true,
        investor: true,
      },
    });
    if (!interest) throw new NotFoundException('Interest not found');

    const isStartupOwner = interest.startup.userId === userId;
    const isInvestorOwner = interest.investor.userId === userId;

    if (!isStartupOwner && !isInvestorOwner) {
      throw new ForbiddenException('Unauthorized to confirm commitment');
    }

    const startupConfirmed = isStartupOwner ? true : interest.startupConfirmed;
    const investorConfirmed = isInvestorOwner ? true : interest.investorConfirmed;
    const isBothConfirmed = startupConfirmed && investorConfirmed;

    const updated = await this.prisma.interest.update({
      where: { id },
      data: {
        startupConfirmed,
        investorConfirmed,
        ...(isBothConfirmed && {
          status: InterestStatus.COMMITTED,
          committedAt: new Date(),
        }),
      },
    });

    const otherUserId = isStartupOwner ? interest.investor.userId : interest.startup.userId;
    await this.prisma.notification.create({
      data: {
        userId: otherUserId,
        type: NotificationType.INTEREST_ACCEPTED,
        title: isBothConfirmed ? 'Deal Committed!' : 'Commitment Confirmed',
        body: isBothConfirmed
          ? `Deal between ${interest.startup.companyName} and ${interest.investor.displayName} is officially marked COMMITTED!`
          : `The other party has confirmed their commitment for ₹${(Number(interest.ticketAmount) / 10000000).toFixed(2)} Lakh.`,
        data: { interestId: id, isBothConfirmed },
      },
    });

    return updated;
  }
}
