import { Injectable } from '@nestjs/common';
import { LessonService } from '../lessons/lesson.service';
import { UserService } from '../users/user.service';
import { PracticeEntityService } from '../practice/services/practice-entity.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly lessonService: LessonService,
    private readonly userService: UserService,
    private readonly practiceEntityService: PracticeEntityService,
  ) {}

  async getPublicStats(options?: { includeUsers?: boolean }): Promise<{
    totalLessons: number;
    totalViews: number;
    totalPractices: number;
    totalUsers?: number;
  }> {
    const [{ totalLessons, totalViews }, totalPractices] = await Promise.all([
      this.lessonService.getLessonsAggregateStats(),
      this.practiceEntityService.countForPublishedLessons(),
    ]);

    let totalUsers: number | undefined;
    if (options?.includeUsers) {
      try {
        const usersAgg = await this.userService.getUserAggregateStats();
        totalUsers = usersAgg.totalUsers;
      } catch {
        totalUsers = undefined;
      }
    }

    return { totalLessons, totalViews, totalPractices, totalUsers };
  }
}


