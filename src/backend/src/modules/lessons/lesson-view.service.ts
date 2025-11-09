import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonView } from './lesson-view.entity';
import { LessonService } from './lesson.service';

@Injectable()
export class LessonViewService {
    constructor(
        @InjectRepository(LessonView)
        private readonly lessonViewRepository: Repository<LessonView>,
        private readonly lessonService: LessonService,
    ) {}

    async trackLessonView(userId: string, lessonId: string): Promise<LessonView> {
        let lessonView = await this.lessonViewRepository.findOne({
            where: {
                userId,
                lessonId,
            },
        });

        if (lessonView) {
            lessonView.viewCount += 1;
            lessonView.lastViewedAt = new Date();
        } else {
            lessonView = this.lessonViewRepository.create({
                userId,
                lessonId,
                viewedAt: new Date(),
                lastViewedAt: new Date(),
                viewCount: 1,
            });
        }

        const savedView = await this.lessonViewRepository.save(lessonView);

        await this.updateLessonViewsCount(lessonId);

        return savedView;
    }

    async getUserLessonViews(
        userId: string,
        options?: {
            limit?: number;
            offset?: number;
            orderBy?: 'viewedAt' | 'lastViewedAt' | 'viewCount';
            order?: 'ASC' | 'DESC';
        },
    ): Promise<{ data: LessonView[]; total: number }> {
        const {
            limit = 20,
            offset = 0,
            orderBy = 'lastViewedAt',
            order = 'DESC',
        } = options || {};

        const [data, total] = await this.lessonViewRepository.findAndCount({
            where: { userId },
            relations: ['lesson'],
            skip: offset,
            take: limit,
            order: { [orderBy]: order },
        });

        return { data, total };
    }

    async getLessonViewStats(lessonId: string): Promise<{
        totalViews: number;
        uniqueViewers: number;
        averageViewsPerUser: number;
    }> {
        const stats = await this.lessonViewRepository
            .createQueryBuilder('lv')
            .select('SUM(lv.view_count)', 'totalViews')
            .addSelect('COUNT(lv.id)', 'uniqueViewers')
            .where('lv.lesson_id = :lessonId', { lessonId })
            .getRawOne<{ totalViews: string; uniqueViewers: string }>();

        const totalViews = Number(stats?.totalViews || 0);
        const uniqueViewers = Number(stats?.uniqueViewers || 0);
        const averageViewsPerUser = uniqueViewers > 0 ? totalViews / uniqueViewers : 0;

        return {
            totalViews,
            uniqueViewers,
            averageViewsPerUser: Math.round(averageViewsPerUser * 100) / 100,
        };
    }

    async hasUserViewedLesson(userId: string, lessonId: string): Promise<boolean> {
        const count = await this.lessonViewRepository.count({
            where: {
                userId,
                lessonId,
            },
        });
        return count > 0;
    }

    async getUserLessonViewCount(userId: string, lessonId: string): Promise<number> {
        const lessonView = await this.lessonViewRepository.findOne({
            where: {
                userId,
                lessonId,
            },
        });
        return lessonView?.viewCount || 0;
    }

    private async updateLessonViewsCount(lessonId: string): Promise<void> {
        const stats = await this.getLessonViewStats(lessonId);
        await this.lessonService.updateLessonViews(lessonId, stats.totalViews);
    }

    async getUniqueViewersCount(): Promise<number> {
        const result = await this.lessonViewRepository
            .createQueryBuilder('view')
            .select('COUNT(DISTINCT view.userId)', 'count')
            .getRawOne<{ count: string }>();

        return result?.count ? parseInt(result.count) : 0;
    }

    async getUniqueViewers(): Promise<string[]> {
        const result = await this.lessonViewRepository
            .createQueryBuilder('view')
            .select('DISTINCT view.userId', 'userId')
            .getRawMany<{ userId: string }>();

        return result.map(r => r.userId);
    }

    async getUniqueEngagedUsersCount(): Promise<number> {
        const result = await this.lessonViewRepository.manager.query(`
            SELECT COUNT(DISTINCT user_id) as count
            FROM (
                SELECT DISTINCT user_id FROM lesson_view
                UNION
                SELECT DISTINCT user_id FROM rating
            ) AS engaged_users
        `);

        return result?.[0]?.count ? parseInt(result[0].count, 10) : 0;
    }
}

