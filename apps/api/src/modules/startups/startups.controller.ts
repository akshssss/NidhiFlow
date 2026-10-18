import {
  Controller, Get, Put, Post, Body, Param, Query,
  UseGuards, SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { StartupsService } from './startups.service';
import { UpdateStartupDto, StartupQueryDto, CreateUpdateDto } from './startups.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Startups')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Get()
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'List all published startups with filters' })
  async findAll(@Query() query: StartupQueryDto) {
    return this.startupsService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own startup profile' })
  async getMyStartup(@CurrentUser('id') userId: string) {
    return this.startupsService.findByUserId(userId);
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get startup dashboard stats' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.startupsService.getDashboard(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own startup profile' })
  async updateMyStartup(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStartupDto,
  ) {
    return this.startupsService.update(userId, dto);
  }

  @Post('me/updates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STARTUP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a startup update' })
  async createUpdate(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateUpdateDto,
  ) {
    return this.startupsService.createUpdate(userId, dto);
  }

  @Get(':id')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get startup by ID (public profile)' })
  async findById(@Param('id') id: string) {
    return this.startupsService.findById(id);
  }

  @Get(':id/updates')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Get startup updates' })
  async getUpdates(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.startupsService.getUpdates(id, page, pageSize);
  }
}
