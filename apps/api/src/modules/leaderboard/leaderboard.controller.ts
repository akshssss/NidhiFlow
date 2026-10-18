import { Controller, Get, Post, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto } from './leaderboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('startups')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get public startup leaderboard ranked by weighted algorithm' })
  async getStartupLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getStartupLeaderboard(query);
  }

  @Get('investors')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get public investor leaderboard ranked by rating & transparency' })
  async getInvestorLeaderboard(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.leaderboardService.getInvestorLeaderboard(page, pageSize);
  }

  @Post('recompute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin manual trigger to recompute all leaderboard rankings' })
  async recompute() {
    return this.leaderboardService.recomputeAllScores();
  }
}
