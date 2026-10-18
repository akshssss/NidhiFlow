import {
  Controller, Get, Post, Put, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { VerificationService } from './verification.service';
import {
  SubmitStartupVerificationDto,
  SubmitInvestorVerificationDto,
  ReviewVerificationDto,
} from './verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Verification')
@Controller('verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('startup/submit')
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Submit startup statutory details for verification' })
  async submitStartup(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitStartupVerificationDto,
  ) {
    return this.verificationService.submitStartupVerification(userId, dto);
  }

  @Post('investor/submit')
  @Roles(UserRole.INVESTOR)
  @ApiOperation({ summary: 'Submit investor credentials for verification' })
  async submitInvestor(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitInvestorVerificationDto,
  ) {
    return this.verificationService.submitInvestorVerification(userId, dto);
  }

  @Get('queue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin review queue for pending verifications' })
  async getQueue() {
    return this.verificationService.getPendingQueue();
  }

  @Put('startup/:id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin approve or reject startup verification' })
  async reviewStartup(
    @Param('id') startupId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.verificationService.reviewStartup(startupId, adminUserId, dto);
  }

  @Put('investor/:id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin approve or reject investor verification' })
  async reviewInvestor(
    @Param('id') investorId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.verificationService.reviewInvestor(investorId, adminUserId, dto);
  }
}
