/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { LessonGenerationService } from './services/lesson-generation.service';
import { LessonViewService } from './lesson-view.service';
import { RatingService } from './rating.service';
import { RatingGateway } from './rating.gateway';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { SourceType } from './dto/generate-lesson.dto';

describe('LessonController', () => {
  let controller: LessonController;
  let lessonService: jest.Mocked<LessonService>;
  let generationService: jest.Mocked<LessonGenerationService>;
  let viewService: jest.Mocked<LessonViewService>;
  let ratingService: jest.Mocked<RatingService>;
  let ratingGateway: jest.Mocked<RatingGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        { provide: LessonService, useValue: {
          getLessons: jest.fn(),
          createLesson: jest.fn(),
          updateLesson: jest.fn(),
          deleteLesson: jest.fn(),
        } },
        { provide: LessonGenerationService, useValue: {
          generateLesson: jest.fn(),
        } },
        { provide: LessonViewService, useValue: {
          trackLessonView: jest.fn(),
          getUserLessonViews: jest.fn(),
          getLessonViewStats: jest.fn(),
          hasUserViewedLesson: jest.fn(),
          getUserLessonViewCount: jest.fn(),
        } },
        { provide: RatingService, useValue: {
          createRating: jest.fn(),
          updateRating: jest.fn(),
          deleteRating: jest.fn(),
          getUserRating: jest.fn(),
          getLessonRatingStats: jest.fn(),
          getLessonRatings: jest.fn(),
        } },
        { provide: RatingGateway, useValue: {
          emitRatingCreated: jest.fn(),
          emitRatingUpdated: jest.fn(),
          emitRatingDeleted: jest.fn(),
          emitStatsUpdated: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(LessonController);
    lessonService = module.get(LessonService);
    generationService = module.get(LessonGenerationService);
    viewService = module.get(LessonViewService);
    ratingService = module.get(RatingService);
    ratingGateway = module.get(RatingGateway);
  });

  it('getLessons proxies to service', async () => {
    lessonService.getLessons.mockResolvedValue({ items: [], total: 0 } as any);
    const res = await controller.getLessons({} as any);
    expect(res).toEqual({ items: [], total: 0 });
  });

  it('create, update, delete lesson', async () => {
    lessonService.createLesson.mockResolvedValue({ id: 'l1' } as any);
    expect(await controller.createLesson({} as any)).toEqual({ id: 'l1' });
    lessonService.updateLesson.mockResolvedValue({ id: 'l1', title: 't' } as any);
    expect(await controller.updateLesson('l1', {} as any)).toEqual({ id: 'l1', title: 't' });
    lessonService.deleteLesson.mockResolvedValue({ success: true } as any);
    expect(await controller.deleteLesson('l1')).toEqual({ success: true });
  });

  describe('generateLesson', () => {
    it('file source without file throws', async () => {
      await expect(
        controller.generateLesson(undefined as any, { sourceType: SourceType.FILE } as any)
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('file source with file calls generation', async () => {
      const response = {
        html: '<p>ok</p>',
        meta: { model: 'gemini', tokens: 10, citations: [], processingTime: 100 },
        title: 'Generated Lesson',
        slug: 'generated-lesson',
        description: 'Short description'
      };
      generationService.generateLesson.mockResolvedValue(response as any);
      const res = await controller.generateLesson({ buffer: Buffer.from('a'), originalname: 'a.txt' } as any, { sourceType: SourceType.FILE } as any);
      expect(res).toEqual(response);
      expect(generationService.generateLesson).toHaveBeenCalled();
    });

    it('url source without url throws', async () => {
      await expect(
        controller.generateLesson(undefined as any, { sourceType: SourceType.URL } as any)
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('url source with url calls generation', async () => {
      const response = {
        html: '<p>ok2</p>',
        meta: { model: 'gemini', tokens: 12, citations: [], processingTime: 120 },
        title: 'Generated Lesson 2',
        slug: 'generated-lesson-2',
        description: 'Another description'
      };
      generationService.generateLesson.mockResolvedValue(response as any);
      const res = await controller.generateLesson(undefined as any, { sourceType: SourceType.URL, url: 'https://a' } as any);
      expect(res).toEqual(response);
    });

    it('invalid source type throws', async () => {
      await expect(
        controller.generateLesson(undefined as any, { sourceType: 'OTHER' as any })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('trackLessonView forwards', async () => {
    viewService.trackLessonView.mockResolvedValue({ ok: true } as any);
    const res = await controller.trackLessonView('u1', { lessonId: 'l1' } as any);
    expect(res).toEqual({ ok: true });
  });

  it('trackLessonView propagates BadRequest from service', async () => {
    viewService.trackLessonView.mockRejectedValue(new BadRequestException('invalid id'));
    await expect(controller.trackLessonView('u1', { lessonId: 'bad' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getMyLessonViews forwards with numeric conversion', async () => {
    viewService.getUserLessonViews.mockResolvedValue({ items: [], total: 0 } as any);
    const res = await controller.getMyLessonViews('u1', '10' as any, '5' as any, 'viewedAt' as any, 'DESC' as any);
    expect(res).toEqual({ items: [], total: 0 });
  });

  it('getLessonViewStats forwards', async () => {
    viewService.getLessonViewStats.mockResolvedValue({ views: 1 } as any);
    const res = await controller.getLessonViewStats('l1');
    expect(res).toEqual({ views: 1 });
  });

  it('getMyLessonViews handles undefined numeric params', async () => {
    viewService.getUserLessonViews.mockResolvedValue({ items: [], total: 0 } as any);
    const res = await controller.getMyLessonViews('u1', undefined as any, undefined as any, undefined as any, undefined as any);
    expect(res).toEqual({ items: [], total: 0 });
  });

  it('hasUserViewedLesson combines two service calls', async () => {
    viewService.hasUserViewedLesson.mockResolvedValue(true);
    viewService.getUserLessonViewCount.mockResolvedValue(3 as any);
    const res = await controller.hasUserViewedLesson('u1', 'l1');
    expect(res).toEqual({ hasViewed: true, viewCount: 3 });
  });

  describe('ratings', () => {
    it('create new rating path', async () => {
      ratingService.createRating.mockResolvedValue({} as any);
      ratingService.getUserRating.mockResolvedValue({ id: 'r1', userId: 'u1', lessonId: 'l1' } as any);
      ratingService.getLessonRatingStats.mockResolvedValue({ avg: 5 } as any);
      const res = await controller.createRating('u1', 'l1', { rating: 5 } as any);
      expect(res).toMatchObject({ id: 'r1' });
      expect(ratingGateway.emitRatingCreated).toHaveBeenCalled();
      expect(ratingGateway.emitStatsUpdated).toHaveBeenCalled();
    });

    it('update on conflict path', async () => {
      ratingService.createRating.mockRejectedValue(new ConflictException());
      ratingService.updateRating.mockResolvedValue({} as any);
      ratingService.getUserRating.mockResolvedValue({ id: 'r2', userId: 'u1', lessonId: 'l1' } as any);
      ratingService.getLessonRatingStats.mockResolvedValue({ avg: 4 } as any);
      const res = await controller.createRating('u1', 'l1', { rating: 4 } as any);
      expect(res).toMatchObject({ id: 'r2' });
      expect(ratingGateway.emitRatingUpdated).toHaveBeenCalled();
      expect(ratingGateway.emitStatsUpdated).toHaveBeenCalled();
    });

    it('updateRating emits and returns mapped', async () => {
      ratingService.updateRating.mockResolvedValue({} as any);
      ratingService.getUserRating.mockResolvedValue({ id: 'r3', userId: 'u1', lessonId: 'l1' } as any);
      ratingService.getLessonRatingStats.mockResolvedValue({ avg: 3 } as any);
      const res = await controller.updateRating('u1', 'l1', { rating: 3 } as any);
      expect(res).toMatchObject({ id: 'r3' });
      expect(ratingGateway.emitRatingUpdated).toHaveBeenCalled();
      expect(ratingGateway.emitStatsUpdated).toHaveBeenCalled();
    });

    it('deleteRating emits and returns message', async () => {
      ratingService.deleteRating.mockResolvedValue(undefined);
      ratingService.getLessonRatingStats.mockResolvedValue({ avg: 0 } as any);
      const res = await controller.deleteRating('u1', 'l1');
      expect(res).toEqual({ message: 'Rating deleted successfully' });
      expect(ratingGateway.emitRatingDeleted).toHaveBeenCalledWith('l1', 'u1');
      expect(ratingGateway.emitStatsUpdated).toHaveBeenCalled();
    });

    it('getUserRating returns null if no rating', async () => {
      ratingService.getUserRating.mockResolvedValue(null as any);
      const res = await controller.getUserRating('u1', 'l1');
      expect(res).toBeNull();
    });

    it('getLessonRatingStats forwards', async () => {
      ratingService.getLessonRatingStats.mockResolvedValue({ avg: 2 } as any);
      const res = await controller.getLessonRatingStats('l1');
      expect(res).toEqual({ avg: 2 });
    });

    it('getLessonRatings maps responses', async () => {
      ratingService.getLessonRatings.mockResolvedValue([
        { id: 'r1', userId: 'u1', lessonId: 'l1', rating: 5, comment: 'c', createdAt: new Date(), updatedAt: new Date(), user: { id: 'u1' } },
      ] as any);
      const res = await controller.getLessonRatings('l1');
      expect(res[0]).toHaveProperty('id', 'r1');
    });

    it('createRating propagates unexpected errors', async () => {
      ratingService.createRating.mockRejectedValue(new Error('db down'));
      await expect(controller.createRating('u1', 'l1', { rating: 5 } as any)).rejects.toThrow('db down');
    });

    it('updateRating propagates errors', async () => {
      ratingService.updateRating.mockRejectedValue(new Error('not allowed'));
      await expect(controller.updateRating('u1', 'l1', { rating: 1 } as any)).rejects.toThrow('not allowed');
    });

    it('deleteRating propagates errors', async () => {
      ratingService.deleteRating.mockRejectedValue(new Error('not found'));
      await expect(controller.deleteRating('u1', 'l1')).rejects.toThrow('not found');
    });
  });
});



