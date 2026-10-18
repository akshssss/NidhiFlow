import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InterestsService } from './interests.service';
import { ExpressInterestDto, InterestQueryDto } from './interests.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Interests & Deal Flow')
@Controller('interests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @Roles(UserRole.INVESTOR)
  @ApiOperation({ summary: 'Investor expresses investment interest in a startup' })
  async expressInterest(
    @CurrentUser('id') userId: string,
    @Body() dto: ExpressInterestDto,
  ) {
    return this.interestsService.expressInterest(userId, dto);
  }

  @Get('startup')
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Get incoming interests for logged-in startup' })
  async getReceivedInterests(
    @CurrentUser('id') userId: string,
    @Query() query: InterestQueryDto,
  ) {
    return this.interestsService.getReceivedInterests(userId, query);
  }

  @Get('investor')
  @Roles(UserRole.INVESTOR)
  @ApiOperation({ summary: 'Get sent interests for logged-in investor' })
  async getSentInterests(
    @CurrentUser('id') userId: string,
    @Query() query: InterestQueryDto,
  ) {
    return this.interestsService.getSentInterests(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single interest deal details' })
  async getInterestById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interestsService.getInterestById(userId, id);
  }

  @Put(':id/accept')
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Startup accepts investor interest' })
  async acceptInterest(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interestsService.acceptInterest(userId, id);
  }

  @Put(':id/decline')
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Startup declines investor interest' })
  async declineInterest(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interestsService.declineInterest(userId, id);
  }

  @Put(':id/commit')
  @ApiOperation({ summary: 'Confirm commitment from either founder or investor side' })
  async confirmCommitment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interestsService.confirmCommitment(userId, id);
  }
}
