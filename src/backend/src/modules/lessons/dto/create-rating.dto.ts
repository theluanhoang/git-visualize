import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Great lesson! Very helpful.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class UpdateRatingDto extends CreateRatingDto {}

