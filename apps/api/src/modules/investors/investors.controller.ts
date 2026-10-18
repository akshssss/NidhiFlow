import {
  Controller, Get, Put, Post, Delete, Body, Param, Query,
  UseGuards, SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InvestorsService } from './investors.service';
import { UpdateInvestorDto, InvestorQueryDto } from './investors.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Investors')
@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Get()
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'List all verified/active investors with filters' })
  async findAll(@Query() query: InvestorQueryDto) {
    return this.investorsService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own investor profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.investorsService.findByUserId(userId);
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get investor dashboard metrics & portfolio' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.investorsService.getDashboard(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own investor profile' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateInvestorDto,
  ) {
    return this.investorsService.update(userId, dto);
  }

  @Get('me/saved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved/shortlisted startups' })
  async getSavedStartups(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.investorsService.getSavedStartups(userId, page, pageSize);
  }

  @Post('me/saved/:startupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark/save a startup' })
  async saveStartup(
    @CurrentUser('id') userId: string,
    @Param('startupId') startupId: string,
  ) {
    return this.investorsService.saveStartup(userId, startupId);
  }

  @Delete('me/saved/:startupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a saved startup' })
  async unsaveStartup(
    @CurrentUser('id') userId: string,
    @Param('startupId') startupId: string,
  ) {
    return this.investorsService.unsaveStartup(userId, startupId);
  }

  @Get(':id')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get investor by ID (public profile)' })
  async findById(@Param('id') id: string) {
    return this.investorsService.findById(id);
  }
}
