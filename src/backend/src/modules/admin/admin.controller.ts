import { Controller, Post, Param, Body, UseGuards, UploadedFiles, UseInterceptors, Get, Patch, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForAdmin } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { SendEmailDto } from '../users/dto/send-email.dto';
import { UsersResponseDto } from '../users/dto/analytics.dto';
import { GetUsersQueryDto } from '../users/user.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UserService } from '../users/user.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filtering (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: UsersResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, description: 'Sort order' })
  @ForAdmin()
  async getAllUsers(@Query() query: GetUsersQueryDto): Promise<UsersResponseDto> {
    return this.userService.getUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (admin only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully', type: UserResponseDto })
  @ForAdmin()
  async updateUserStatus(@Param('id') id: string, @Body() body: { isActive: boolean }): Promise<UserResponseDto> {
    return this.userService.updateUserStatus(id, body.isActive);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ForAdmin()
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Post('users/:id/email')
  @ApiOperation({ summary: 'Send email to a specific user (admin only)' })
  @ApiResponse({ status: 200, description: 'Email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ForAdmin()
  @UseInterceptors(FilesInterceptor('attachments'))
  async sendEmailToUser(
    @Param('id') id: string,
    @Body() dto: SendEmailDto,
    @UploadedFiles() attachments: { originalname: string; buffer?: Buffer; mimetype?: string; path?: string }[]
  ): Promise<{ message: string }> {
    await this.adminService.sendEmailToUser(id, dto.subject, dto.message, attachments);
    return { message: 'Email sent' };
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  @ForAdmin()
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/metrics')
  @ApiOperation({ summary: 'Get analytics metrics (total time spent, completion rate, average session time, engagement rate)' })
  @ApiResponse({ status: 200, description: 'Analytics metrics retrieved' })
  @ForAdmin()
  async getAnalyticsMetrics() {
    return this.adminService.getAnalyticsMetrics();
  }

  @Get('analytics/device-usage')
  @ApiOperation({ summary: 'Get device usage breakdown' })
  @ApiResponse({ status: 200, description: 'Device usage retrieved' })
  @ForAdmin()
  async getDeviceUsage() {
    return this.adminService.getDeviceUsageBreakdown();
  }

  @Get('analytics/hourly-activity')
  @ApiOperation({ summary: 'Get hourly user activity counts (by session creation hour)' })
  @ApiResponse({ status: 200, description: 'Hourly activity retrieved' })
  @ForAdmin()
  async getHourlyActivity(@Query('date') date?: string) {
    return this.adminService.getHourlyActivity(date);
  }
}


