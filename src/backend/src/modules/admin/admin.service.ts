import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService, MailAttachment } from '../mail/mail.service';
import { UserService } from '../users/user.service';
import { LessonService } from '../lessons/lesson.service';
import { SessionService } from '../sessions/session.service';
import { PracticeEntityService } from '../practice/services/practice-entity.service';
import { LessonViewService } from '../lessons/lesson-view.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly lessonService: LessonService,
    private readonly sessionService: SessionService,
    private readonly practiceEntityService: PracticeEntityService,
    private readonly lessonViewService: LessonViewService,
  ) {}

  async sendEmailToUser(
    userId: string,
    subject: string,
    message: string,
    attachments: { originalname: string; buffer?: Buffer; mimetype?: string; path?: string }[] = []
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const mailAttachments: MailAttachment[] = (attachments || []).map((f) => ({
      filename: f.originalname,
      content: (f.buffer || Buffer.from('')) as Buffer,
      contentType: f.mimetype,
    }));

    await this.mailService.send({
      to: user.email,
      subject,
      text: message,
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6">${message.replace(/\n/g, '<br/>')}</div>`,
      attachments: mailAttachments,
    });
  }

  async getDashboardStats() {
    const { totalLessons, totalViews } = await this.lessonService.getLessonsAggregateStats();
    const { totalUsers, recentActivity } = await this.userService.getUserAggregateStats();
    return {
      totalLessons,
      totalUsers,
      totalViews,
      recentActivity,
    };
  }

  async getAnalyticsMetrics() {
    const totalTimeSpent = await this.calculateTotalTimeSpent();
    
    const completionRate = await this.calculateCompletionRate();
    
    const averageSessionTime = await this.calculateAverageSessionTime();
    
    const engagementRate = await this.calculateEngagementRate();

    return {
      totalTimeSpent,
      completionRate,
      averageSessionTime,
      engagementRate,
    };
  }

  async getDeviceUsageBreakdown(): Promise<Array<{ device: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown'; count: number }>> {
    try {
      const agg = await this.sessionService.getDeviceUsageAggregate();

      const result: Array<{ device: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown'; count: number }> = [
        { device: 'Desktop', count: agg.desktop },
        { device: 'Mobile', count: agg.mobile },
        { device: 'Tablet', count: agg.tablet },
        { device: 'Bot', count: agg.bot },
        { device: 'Unknown', count: agg.unknown },
      ];

      return result;
    } catch (error) {
      console.error('Error calculating device usage:', error);
      return [
        { device: 'Desktop', count: 0 },
        { device: 'Mobile', count: 0 },
        { device: 'Tablet', count: 0 },
        { device: 'Bot', count: 0 },
        { device: 'Unknown', count: 0 },
      ];
    }
  }

  async getHourlyActivity(date?: string): Promise<Array<{ hour: string; users: number }>> {
    try {
      return this.sessionService.getHourlyActivityAggregate(date);
    } catch (error) {
      console.error('Error calculating hourly activity:', error);
      return Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, users: 0 }));
    }
  }

  private async calculateTotalTimeSpent(): Promise<{ hours: number; minutes: number }> {
    try {
      const stats = await this.practiceEntityService.getAggregateStats();
      const totalMinutes = stats.totalTimeSpent.totalMinutes;
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = Math.floor(totalMinutes % 60);

      return {
        hours: totalHours,
        minutes: remainingMinutes,
      };
    } catch (error) {
      console.error('Error calculating total time spent:', error);
      return { hours: 0, minutes: 0 };
    }
  }

  private async calculateCompletionRate(): Promise<number> {
    try {
      const stats = await this.practiceEntityService.getAggregateStats();
      const { totalCompletions, totalViews } = stats.completionStats;

      if (totalViews === 0) return 0;

      const rate = (totalCompletions / totalViews) * 100;
      return Math.round(rate * 10) / 10;
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  }

  private async calculateAverageSessionTime(): Promise<{ hours: number; minutes: number }> {
    try {
      const now = new Date();
      const sessions = await this.sessionService.getAllSessionsForAnalytics();

      if (sessions.length === 0) return { hours: 0, minutes: 0 };

      let totalMinutes = 0;
      let validSessions = 0;

      sessions.forEach(session => {
        const startTime = session.createdAt;
        let endTime: Date;
        
        if (session.revokedAt) {
          endTime = session.revokedAt;
        } else if (session.expiresAt && session.expiresAt > now) {
          endTime = session.expiresAt;
        } else if (session.expiresAt && session.expiresAt <= now) {
          endTime = session.expiresAt;
        } else {
          endTime = now;
        }

        const duration = Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60)); 
        totalMinutes += duration;
        validSessions++;
      });

      if (validSessions === 0) return { hours: 0, minutes: 0 };

      const avgMinutes = totalMinutes / validSessions;
      const hours = Math.floor(avgMinutes / 60);
      const minutes = Math.round(avgMinutes % 60);

      return { hours, minutes };
    } catch (error) {
      console.error('Error calculating average session time:', error);
      return { hours: 0, minutes: 0 };
    }
  }

  private async calculateEngagementRate(): Promise<number> {
    try {
      const totalUsers = await this.userService.getUserAggregateStats();
      const userCount = totalUsers.totalUsers;

      if (userCount === 0) return 0;

      const totalEngagedUsers = await this.lessonViewService.getUniqueEngagedUsersCount();

      const engagementRate = (totalEngagedUsers / userCount) * 100;
      return Math.round(engagementRate * 10) / 10;
    } catch (error) {
      console.error('Error calculating engagement rate:', error);
      return 0;
    }
  }
}


