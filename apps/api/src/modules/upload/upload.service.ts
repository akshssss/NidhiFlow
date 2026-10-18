import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async saveUploadedDocument(
    userId: string,
    file: {
      originalname: string;
      filename: string;
      size: number;
      mimetype: string;
      path: string;
    },
    type: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startup: true, investor: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const apiUrl = this.configService.get<string>('API_URL', 'http://localhost:4000');
    const fileUrl = `${apiUrl}/uploads/${file.filename}`;

    const document = await this.prisma.document.create({
      data: {
        startupId: user.startup?.id || null,
        investorId: user.investor?.id || null,
        type: type || 'general',
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return {
      document,
      url: fileUrl,
    };
  }

  async getMyDocuments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startup: true, investor: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.startup) {
      return this.prisma.document.findMany({
        where: { startupId: user.startup.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.investor) {
      return this.prisma.document.findMany({
        where: { investorId: user.investor.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }
}
