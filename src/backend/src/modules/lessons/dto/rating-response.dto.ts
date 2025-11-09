import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  avatar?: string;
}

export class RatingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  rating: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: UserInfoDto, required: false })
  user?: UserInfoDto;
}

export class LessonRatingStatsDto {
  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatings: number;

  @ApiProperty()
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

