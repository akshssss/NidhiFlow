import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, VerificationStatus } from '@prisma/client';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin always passes
    if (user.role === UserRole.ADMIN) return true;

    if (user.role === UserRole.STARTUP) {
      const startup = await this.prisma.startup.findUnique({
        where: { userId: user.id },
        select: { verificationStatus: true },
      });
      if (startup?.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new ForbiddenException('Your startup must be verified to perform this action');
      }
    }

    if (user.role === UserRole.INVESTOR) {
      const investor = await this.prisma.investor.findUnique({
        where: { userId: user.id },
        select: { verificationStatus: true },
      });
      if (investor?.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new ForbiddenException('Your investor profile must be verified to perform this action');
      }
    }

    return true;
  }
}
