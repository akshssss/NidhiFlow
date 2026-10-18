import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto, ChatMessageQueryDto } from './chat.dto';
import { paginate } from '../../common/utils/helpers';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserRooms(userId: string) {
    const memberships = await this.prisma.chatRoomMember.findMany({
      where: { userId, isBlocked: false },
      include: {
        chatRoom: {
          include: {
            interest: {
              include: {
                startup: { select: { id: true, companyName: true, logoUrl: true, sector: true, userId: true } },
                investor: { select: { id: true, displayName: true, avatarUrl: true, firmName: true, userId: true } },
              },
            },
            members: {
              include: {
                user: { select: { id: true, name: true, role: true } },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { chatRoom: { updatedAt: 'desc' } },
    });

    return memberships.map((m) => {
      const room = m.chatRoom;
      const latestMsg = room.messages[0] || null;
      return {
        id: room.id,
        interestId: room.interestId,
        interest: room.interest,
        members: room.members,
        lastMessage: latestMsg,
        lastReadAt: m.lastReadAt,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      };
    });
  }

  async getRoomMessages(roomId: string, userId: string, query: ChatMessageQueryDto) {
    const member = await this.prisma.chatRoomMember.findUnique({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this chat room');
    }

    const { page = 1, pageSize = 50 } = query;
    const where = { chatRoomId: roomId, deletedAt: null };

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.chatMessage.count({ where }),
    ]);

    // Update lastReadAt
    await this.markRoomAsRead(roomId, userId);

    return paginate(messages, total, page, pageSize);
  }

  async sendMessage(roomId: string, senderId: string, dto: SendMessageDto) {
    const member = await this.prisma.chatRoomMember.findUnique({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId: senderId } },
    });

    if (!member || member.isBlocked) {
      throw new ForbiddenException('You cannot send messages in this room');
    }

    const [message] = await Promise.all([
      this.prisma.chatMessage.create({
        data: {
          chatRoomId: roomId,
          senderId,
          content: dto.content,
          fileUrl: dto.fileUrl || null,
          fileName: dto.fileName || null,
          fileSize: dto.fileSize || null,
          mimeType: dto.mimeType || null,
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      }),
      this.prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      }),
      this.prisma.chatRoomMember.update({
        where: { chatRoomId_userId: { chatRoomId: roomId, userId: senderId } },
        data: { lastReadAt: new Date() },
      }),
    ]);

    return message;
  }

  async markRoomAsRead(roomId: string, userId: string) {
    const now = new Date();
    await Promise.all([
      this.prisma.chatRoomMember.updateMany({
        where: { chatRoomId: roomId, userId },
        data: { lastReadAt: now },
      }),
      this.prisma.chatMessage.updateMany({
        where: {
          chatRoomId: roomId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: now,
        },
      }),
    ]);
  }
}
