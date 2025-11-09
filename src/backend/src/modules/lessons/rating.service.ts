import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { LessonRatingStatsDto } from './dto/rating-response.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async createRating(userId: string, lessonId: string, dto: CreateRatingDto): Promise<Rating> {
    const existingRating = await this.ratingRepository.findOne({
      where: { userId, lessonId },
    });

    if (existingRating) {
      throw new ConflictException('User has already rated this lesson. Use update instead.');
    }

    const rating = this.ratingRepository.create({
      userId,
      lessonId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.ratingRepository.save(rating);
  }

  async updateRating(userId: string, lessonId: string, dto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { userId, lessonId },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    rating.rating = dto.rating;
    if (dto.comment !== undefined) {
      rating.comment = dto.comment;
    }

    return this.ratingRepository.save(rating);
  }

  async deleteRating(userId: string, lessonId: string): Promise<void> {
    const result = await this.ratingRepository.delete({ userId, lessonId });
    if (result.affected === 0) {
      throw new NotFoundException('Rating not found');
    }
  }

  async getUserRating(userId: string, lessonId: string): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { userId, lessonId },
      relations: ['user'],
    });
  }

  async getLessonRatings(lessonId: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { lessonId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLessonRatingStats(lessonId: string): Promise<LessonRatingStatsDto> {
    const ratings = await this.ratingRepository.find({
      where: { lessonId },
      select: ['rating'],
    });

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / totalRatings) * 10) / 10;

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      averageRating,
      totalRatings,
      ratingDistribution: distribution,
    };
  }

  async getAverageRating(lessonId: string): Promise<number> {
    const stats = await this.getLessonRatingStats(lessonId);
    return stats.averageRating;
  }

  async getUniqueRatersCount(): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('COUNT(DISTINCT rating.userId)', 'count')
      .getRawOne<{ count: string }>();

    return result?.count ? parseInt(result.count) : 0;
  }

  async getUniqueRaters(): Promise<string[]> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('DISTINCT rating.userId', 'userId')
      .getRawMany<{ userId: string }>();

    return result.map(r => r.userId);
  }

  async getPositiveRatersCount(): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('COUNT(DISTINCT rating.userId)', 'count')
      .where('rating.rating >= :minRating', { minRating: 4 })
      .getRawOne<{ count: string }>();

    return result?.count ? parseInt(result.count) : 0;
  }

  async getPositiveRaters(): Promise<string[]> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('DISTINCT rating.userId', 'userId')
      .where('rating.rating >= :minRating', { minRating: 4 })
      .getRawMany<{ userId: string }>();

    return result.map(r => r.userId);
  }

  async getRatingsForLessons(lessonIds: string[]): Promise<Record<string, number>> {
    if (lessonIds.length === 0) {
      return {};
    }

    const results = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.lessonId', 'lessonId')
      .addSelect('AVG(rating.rating)', 'averageRating')
      .where('rating.lessonId IN (:...lessonIds)', { lessonIds })
      .groupBy('rating.lessonId')
      .getRawMany<{ lessonId: string; averageRating: string }>();

    const ratingsMap: Record<string, number> = {};
    results.forEach((result) => {
      ratingsMap[result.lessonId] = parseFloat(result.averageRating) || 0;
    });

    return ratingsMap;
  }
}

