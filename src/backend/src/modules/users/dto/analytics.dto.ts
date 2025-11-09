import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString } from 'class-validator';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of lessons' })
  @IsNumber()
  totalLessons: number;

  @ApiProperty({ description: 'Total number of users' })
  @IsNumber()
  totalUsers: number;

  @ApiProperty({ description: 'Total number of views across all lessons' })
  @IsNumber()
  totalViews: number;

  @ApiProperty({ description: 'Number of users who joined in the last 7 days' })
  @IsNumber()
  recentActivity: number;
}

export class RecentUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'User status' })
  status: string;

  @ApiProperty({ description: 'Date when user joined' })
  @IsDateString()
  joinedAt: string;

  @ApiProperty({ description: 'Number of lessons completed' })
  @IsNumber()
  lessonsCompleted: number;

  @ApiProperty({ description: 'Total sessions' })
  @IsNumber()
  totalSessions: number;

  @ApiProperty({ description: 'Active sessions' })
  @IsNumber()
  activeSessions: number;

  @ApiProperty({ description: 'OAuth sessions' })
  @IsNumber()
  oauthSessions: number;

  @ApiProperty({ description: 'Last login date', required: false })
  @IsDateString()
  lastLoginAt?: Date | null;
}

export class UsersResponseDto {
  @ApiProperty({ description: 'List of users', type: [RecentUserDto] })
  users: RecentUserDto[];

  @ApiProperty({ description: 'Total number of users' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}
