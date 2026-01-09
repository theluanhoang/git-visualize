import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ExtendSubscriptionDto {
  @ApiProperty({
    description: 'Number of days to extend',
    example: 30,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  days: number;
}
