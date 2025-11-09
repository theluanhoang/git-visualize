import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EUserRole } from './user.interface';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-request.dto';
import { SessionService } from '../sessions/session.service';
import { UserResponseDto, UserStatsDto } from './dto/user-response.dto';
import { UsersResponseDto } from './dto/analytics.dto';
import { GetUsersQueryDto } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sessionService: SessionService,
  ) {}

  async getCurrentUserProfile(userId: string): Promise<UserResponseDto> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.getProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateCurrentUserProfile(userId: string, updateData: UpdateProfileDto): Promise<UserResponseDto> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const updatedUser = await this.updateProfile(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async getCurrentUserStats(userId: string): Promise<UserStatsDto> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.getUserStats(userId);
  }

  async getUserByIdWithPermission(targetUserId: string, currentUser: AuthenticatedUserDto): Promise<UserResponseDto> {
    if (!currentUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (currentUser.sub !== targetUserId && currentUser.role !== EUserRole.ADMIN) {
      throw new ForbiddenException('Cannot view other user profiles');
    }

    const user = await this.getProfile(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllUsersWithPermission(currentUser: AuthenticatedUserDto): Promise<UserResponseDto[]> {
    if (!currentUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (currentUser.role !== EUserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.findAll();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getProfile(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'avatar',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async updateProfile(id: string, profileData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<User | null> {
    await this.userRepository.update(id, profileData);
    return this.getProfile(id);
  }

  async getUserStats(id: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    oauthSessions: number;
    lastLoginAt: Date | null;
  }> {
    const { total, active, oauth } = await this.sessionService.getSessionStats(id);
    const lastLoginAt = await this.sessionService.getLastLoginAt(id);

    return {
      totalSessions: total,
      activeSessions: active,
      oauthSessions: oauth,
      lastLoginAt,
    };
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, { isActive });
    const updatedUser = await this.getProfile(id);
    
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  async getUserAggregateStats(): Promise<{ totalUsers: number; recentActivity: number }>{
    const users = await this.userRepository.find();
    const totalUsers = users.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
    return { totalUsers, recentActivity };
  }

  async getUsers(query: GetUsersQueryDto): Promise<UsersResponseDto> {
    try {
      const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
      
      const queryBuilder = this.createUsersQueryBuilder(search, role, status);
      
      const total = await queryBuilder.getCount();
      
      const users = await queryBuilder
        .orderBy(`user.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
      
      const totalPages = Math.ceil(total / limit);
      
      const userDtos = await Promise.all(users.map(async (user) => {
        const { total, active, oauth } = await this.sessionService.getSessionStats(user.id);
        const lastLoginAt = await this.sessionService.getLastLoginAt(user.id);
        return {
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          joinedAt: user.createdAt.toISOString(),
          lessonsCompleted: 0,
          totalSessions: total,
          activeSessions: active,
          oauthSessions: oauth,
          lastLoginAt,
          lastActive: lastLoginAt ? (typeof lastLoginAt === 'string' ? lastLoginAt : lastLoginAt.toISOString()) : null,
        } as any;
      }));
      
      return {
        users: userDtos,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }

  private createUsersQueryBuilder(search?: string, role?: string, status?: string): SelectQueryBuilder<User> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }
    
    return queryBuilder;
  }
}
