import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { EUserRole } from '../users/user.interface';
import * as argon2 from 'argon2';

@Injectable()
export class AdminInitService implements OnModuleInit {
  private readonly logger = new Logger(AdminInitService.name);
  private readonly argon2Options: argon2.Options;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');
    const isProduction = nodeEnv === 'production';
    
    if (isProduction) {
      this.argon2Options = {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      };
    } else {
      this.argon2Options = {
        type: argon2.argon2id,
        memoryCost: 16384,
        timeCost: 2, 
        parallelism: 2, 
      };
    }
  }

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  private async ensureAdminUser() {
    try {
      const adminEmail = this.configService.get<string>(
        'admin.email',
        'admin@example.com',
      );
      const adminPassword = this.configService.get<string>(
        'admin.password',
        'admin123',
      );

      const existingAdmin = await this.userService.findByEmail(adminEmail);
      
      if (existingAdmin) {
        if (existingAdmin.role === EUserRole.ADMIN) {
          this.logger.log(`Admin user already exists: ${adminEmail}`);
          return;
        } else {
          await this.userService.update(existingAdmin.id, {
            role: EUserRole.ADMIN,
            isActive: true,
          });
          this.logger.log(`Updated user to admin: ${adminEmail}`);
          return;
        }
      }

      const passwordHash = await argon2.hash(adminPassword, this.argon2Options);
      await this.userService.create({
        email: adminEmail,
        passwordHash,
        role: EUserRole.ADMIN,
        isActive: true,
        firstName: 'Admin',
        lastName: 'User',
      });

      this.logger.log(`Admin user created successfully: ${adminEmail}`);
      this.logger.warn(
        `Default admin password: ${adminPassword}. Please change it after first login!`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize admin user:', error);
    }
  }
}

