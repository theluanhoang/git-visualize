import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ 
    description: 'User first name',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ 
    description: 'User last name',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ 
    description: 'User avatar URL',
    required: false
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
