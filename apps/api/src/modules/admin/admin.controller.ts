import {
  Controller, Get, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { AdminUserQueryDto, ToggleUserStatusDto } from './admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin Panel')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin high-level platform health & metrics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List and filter platform users' })
  async getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Suspend or activate a user account' })
  async toggleUserStatus(
    @Param('id') userId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: ToggleUserStatusDto,
  ) {
    return this.adminService.toggleUserActive(userId, adminUserId, dto.isActive ?? true);
  }

  @Get('reported-reviews')
  @ApiOperation({ summary: 'Moderation queue of reported reviews' })
  async getReportedReviews(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminService.getReportedReviews(page, pageSize);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'System audit logs of sensitive operations' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminService.getAuditLogs(page, pageSize);
  }
}
