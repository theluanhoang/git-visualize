import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { Repository, IsNull } from 'typeorm';
import { CreateLessonDTO } from './dto/create-lesson.dto';
import { GetLessonsQueryDto } from './dto/get-lessons.query.dto';
import { UpdateLessonDTO } from './dto/update-lesson.dto';
import { PracticeAggregateService } from '../practice/services/practice-aggregate.service';
import { PracticeRepositoryStateService } from '../practice/services/practice-repository-state.service';
import { ELessonStatus } from './lesson.interface';
import { 
  LessonWithPractices, 
  GetLessonsResponse,
} from './types';

@Injectable()
export class LessonService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        @Inject(forwardRef(() => PracticeAggregateService))
        private readonly practiceAggregateService: PracticeAggregateService,
        private readonly practiceRepoStateService: PracticeRepositoryStateService,
    ) {}


    async getLessonsAggregateStats(): Promise<{ totalLessons: number; totalViews: number }>{
        const qb = this.lessonRepository.createQueryBuilder('lesson');
        const countRow = await qb
            .clone()
            .select('COUNT(lesson.id)', 'count')
            .getRawOne<{ count: string }>();
        const sumRow = await qb
            .clone()
            .select('COALESCE(SUM(lesson.views), 0)', 'sum')
            .getRawOne<{ sum: string }>();
        return {
            totalLessons: Number(countRow?.count ?? 0),
            totalViews: Number(sumRow?.sum ?? 0),
        };
    }

    async getLessons(query: GetLessonsQueryDto, userId?: string, isAdmin?: boolean): Promise<GetLessonsResponse<Lesson | LessonWithPractices>>{
        const { limit = 20, offset = 0, id, slug, status, q, includePractices = false } = query;
        
        const baseQb = this.lessonRepository.createQueryBuilder('lesson');
        
        if (id) baseQb.andWhere('lesson.id = :id', { id });
        if (slug) baseQb.andWhere('lesson.slug = :slug', { slug });
        if (status) baseQb.andWhere('lesson.status = :status', { status });
        if (q) {
            baseQb.andWhere('(lesson.title ILIKE :q OR lesson.description ILIKE :q)', { q: `%${q}%` });
        }

        // Filter lessons:
        // - Admin: sees public lessons OR lessons without authorId (admin's own lessons)
        // - Pro users: sees public lessons OR their own lessons (authorId = userId)
        // - Regular users: only public lessons
        // - Not logged in: only public lessons
        if (isAdmin) {
            // Admin sees: public lessons OR lessons without authorId (admin's lessons)
            baseQb.andWhere('(lesson.isPublic = :isPublic OR lesson.authorId IS NULL)', { 
                isPublic: true
            });
        } else {
            if (userId) {
                // Pro users: public lessons OR their own lessons
                // When querying by slug, prioritize their own lesson to avoid conflicts
                if (slug) {
                    // For slug queries, check own lesson first, then public admin lessons
                    baseQb.andWhere('(lesson.authorId = :userId OR (lesson.isPublic = :isPublic AND lesson.authorId IS NULL))', {
                        userId,
                        isPublic: true
                    });
                } else {
                    // For general queries, show public lessons OR their own lessons
                    baseQb.andWhere('(lesson.isPublic = :isPublic OR lesson.authorId = :userId)', { 
                        isPublic: true, 
                        userId 
                    });
                }
            } else {
                // Not logged in: only public lessons
                baseQb.andWhere('lesson.isPublic = :isPublic', { isPublic: true });
            }
        }

        const countQb = baseQb.clone().select('COUNT(DISTINCT lesson.id)', 'count');
        const dataQb = baseQb
            .clone()
            .addSelect('COALESCE(AVG(rating.rating), 0)', 'averageRating')
            .leftJoin('rating', 'rating', 'rating.lesson_id = lesson.id')
            .groupBy('lesson.id')
            .skip(offset)
            .take(limit)
            .orderBy('lesson.createdAt', 'DESC');

        const [totalResult, { entities, raw }] = await Promise.all([
            countQb.getRawOne<{ count: string }>(),
            dataQb.getRawAndEntities()
        ]);

        const total = parseInt(totalResult?.count || '0', 10);

        const lessonsWithRatings = entities.map((lesson, index) => {
            (lesson as any).averageRating = parseFloat(raw[index].averageRating) || 0;
            return lesson;
        }) as (Lesson & { averageRating: number })[];

        const lessonIds = lessonsWithRatings.map(l => l.id);
        const [completionCounts] = await Promise.all([
            lessonIds.length > 0 ? this.getPracticeCompletionCountsForLessons(lessonIds) : Promise.resolve({}),
        ]);
        
        const lessonsWithData = lessonsWithRatings.map((lesson) => {
            (lesson as any).completedUsersCount = completionCounts[lesson.id] || 0;
            return lesson;
        }) as (Lesson & { averageRating: number; completedUsersCount: number })[];

        if (includePractices) {
            const data = await this.fetchPracticesForLessons(lessonsWithData);
            return { data, total, limit, offset } as GetLessonsResponse<LessonWithPractices & { averageRating?: number; completedUsersCount?: number }>;
        }

        return { data: lessonsWithData, total, limit, offset } as GetLessonsResponse<Lesson & { averageRating: number; completedUsersCount: number }>;
    }


    private async fetchPracticesForLessons(lessons: (Lesson & { averageRating?: number })[]): Promise<(LessonWithPractices & { averageRating?: number })[]> {
        return Promise.all(
            lessons.map(async (lesson) => {
                // When fetching practices for lessons, include draft lessons' practices
                // This allows admin and pro users to see practices for their own draft lessons
                const practicesResult = await this.practiceAggregateService.getPractices({ 
                    lessonSlug: lesson.slug,
                    includeRelations: true,
                    publishedOnly: false // Include practices for draft lessons
                });
                const practices = 'data' in practicesResult ? practicesResult.data : [practicesResult as any];
                return {
                    ...lesson,
                    practices: practices,
                    averageRating: lesson.averageRating
                } as LessonWithPractices & { averageRating?: number };
            })
        );
    }

    async createLesson(createLessonDTO: CreateLessonDTO, authorId?: string): Promise<Lesson> {
        const lessonData: any = { ...createLessonDTO };
        
        // Check if slug already exists for this author (or for admin if no authorId)
        const existingLesson = await this.lessonRepository.findOne({
            where: { 
                slug: createLessonDTO.slug,
                authorId: authorId ? authorId : IsNull()
            }
        });

        if (existingLesson) {
            throw new ConflictException(`Slug "${createLessonDTO.slug}" already exists for this user`);
        }

        if (authorId) {
            lessonData.authorId = authorId;
            lessonData.isProContent = true;
            // Pro users' lessons are private by default (only visible to them)
            lessonData.isPublic = false;
            // Pro users' lessons default to DRAFT if not specified
            if (!lessonData.status) {
                lessonData.status = ELessonStatus.DRAFT;
            }
        } else {
            // Admin lessons are public by default and have no authorId
            lessonData.isPublic = true;
            lessonData.isProContent = false;
            // Admin lessons default to PUBLISHED if not specified
            if (!lessonData.status) {
                lessonData.status = ELessonStatus.PUBLISHED;
            }
        }
        return this.lessonRepository.save(lessonData);
    }

    async updateLesson(id: string, dto: UpdateLessonDTO, userId?: string): Promise<Lesson> {
        const existing = await this.lessonRepository.findOne({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Lesson not found');
        }

        // Check ownership: only author or admin can update
        if (userId && existing.authorId && existing.authorId !== userId) {
            throw new NotFoundException('Lesson not found or access denied');
        }

        // Check if slug is being changed and if the new slug already exists
        if (dto.slug && dto.slug !== existing.slug) {
            // Use the same authorId as the existing lesson (or IsNull for admin lessons)
            const authorIdToCheck = existing.authorId ? existing.authorId : IsNull();
            const conflictingLesson = await this.lessonRepository.findOne({
                where: { 
                    slug: dto.slug,
                    authorId: authorIdToCheck
                }
            });

            if (conflictingLesson && conflictingLesson.id !== id) {
                throw new ConflictException(`Slug "${dto.slug}" already exists for this user`);
            }
        }

        const merged = this.lessonRepository.merge(existing, dto);
        return this.lessonRepository.save(merged);
    }

    async getMyLessons(userId: string, limit?: number, offset?: number): Promise<GetLessonsResponse<Lesson>> {
        const qb = this.lessonRepository.createQueryBuilder('lesson')
            .where('lesson.authorId = :userId', { userId })
            .orderBy('lesson.createdAt', 'DESC');

        const total = await qb.getCount();
        
        if (limit !== undefined) {
            qb.take(limit);
        }
        if (offset !== undefined) {
            qb.skip(offset);
        }

        const data = await qb.getMany();

        return {
            data,
            total,
            limit: limit || 20,
            offset: offset || 0,
        };
    }

    async deleteMyLesson(id: string, userId: string): Promise<{ success: true }> {
        const existing = await this.lessonRepository.findOne({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Lesson not found');
        }

        // Check ownership: only author can delete
        if (existing.authorId && existing.authorId !== userId) {
            throw new NotFoundException('Lesson not found or access denied');
        }

        const result = await this.lessonRepository.softDelete({ id });
        if (!result.affected) {
            throw new NotFoundException('Lesson not found');
        }
        return { success: true };
    }

  async deleteLesson(id: string): Promise<{ success: true }>{
    const result = await this.lessonRepository.softDelete({ id });
    if (!result.affected) {
      throw new NotFoundException('Lesson not found');
    }
    return { success: true };
  }

  async updateLessonViews(lessonId: string, views: number): Promise<void> {
    await this.lessonRepository.update(
      { id: lessonId },
      { views },
    );
  }

  async getPracticeCompletionCount(lessonId: string): Promise<number> {
    const practices = await this.practiceAggregateService.getPractices({ 
      lessonId,
      isActive: true 
    });
    
    if (!('data' in practices) || practices.data.length === 0) {
      return 0;
    }

    const practiceIds = practices.data.map(p => p.id);
    
    const mappings = await this.practiceRepoStateService.getPracticeUserMappings(practiceIds);
    const uniqueUsers = new Set(mappings.map(m => m.userId));

    return uniqueUsers.size;
  }

  async getPracticeCompletionCountsForLessons(lessonIds: string[]): Promise<Record<string, number>> {
    return this.practiceRepoStateService.getCompletionCountsByLessons(lessonIds);
  }
}
