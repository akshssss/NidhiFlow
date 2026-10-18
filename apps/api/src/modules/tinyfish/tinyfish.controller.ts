import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TinyFishService } from './tinyfish.service';
import {
  TinyFishSearchDto,
  TinyFishFetchDto,
  TinyFishRunAgentDto,
  TinyFishDueDiligenceDto,
  TinyFishEnrichUrlDto,
  TinyFishAskAgentDto,
} from './tinyfish.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('TinyFish AI Web Agent')
@Controller('tinyfish')
export class TinyFishController {
  constructor(private readonly tinyfishService: TinyFishService) {}

  @Get('health')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Check TinyFish service status, engine mode, and available capabilities' })
  getHealth() {
    return this.tinyfishService.getHealth();
  }

  @Get('due-diligence/:startupId')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Retrieve latest TinyFish due diligence report for a startup' })
  async getDueDiligence(@Param('startupId') startupId: string) {
    return this.tinyfishService.getOrGenerateDueDiligence(startupId, false);
  }

  @Post('due-diligence/:startupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger/Refresh a comprehensive TinyFish AI Due Diligence analysis' })
  async refreshDueDiligence(
    @Param('startupId') startupId: string,
    @Body() dto: TinyFishDueDiligenceDto,
  ) {
    return this.tinyfishService.getOrGenerateDueDiligence(startupId, dto?.forceRefresh ?? true);
  }

  @Post('verify-agent/:startupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute autonomous TinyFish Compliance Agent for statutory verification (Admin only)' })
  async runVerificationAgent(@Param('startupId') startupId: string) {
    return this.tinyfishService.runAdminVerificationAgent(startupId);
  }

  @Post('enrich-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-enrich startup profile and pitch metrics from website URL via TinyFish' })
  async enrichFromUrl(@Body() dto: TinyFishEnrichUrlDto) {
    return this.tinyfishService.enrichFromUrl(dto.url);
  }

  @Post('ask-agent/:startupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask custom due diligence questions to the TinyFish Web Agent' })
  async askAgent(
    @Param('startupId') startupId: string,
    @Body() dto: TinyFishAskAgentDto,
  ) {
    return this.tinyfishService.askAgent(startupId, dto.question);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute agent-optimized web search via TinyFish Search API' })
  async search(@Body() dto: TinyFishSearchDto) {
    return this.tinyfishService.search(dto.query, dto.limit || 5);
  }

  @Post('fetch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch and render clean web pages via TinyFish Fetch API' })
  async fetchUrls(@Body() dto: TinyFishFetchDto) {
    return this.tinyfishService.fetchUrls(dto.urls, dto.format || 'markdown', dto.purpose);
  }

  @Post('agent/run')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run arbitrary browser goal via TinyFish Web Agent API' })
  async runAgent(@Body() dto: TinyFishRunAgentDto) {
    return this.tinyfishService.runAgent(dto.url, dto.goal);
  }
}
