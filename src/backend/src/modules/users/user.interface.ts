import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum EUserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}


export class GetUsersQueryDto {
    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;
  
    @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
  
    @ApiProperty({ description: 'Search term for name or email', required: false })
    @IsOptional()
    @IsString()
    search?: string;
  
    @ApiProperty({ description: 'Filter by role', required: false })
    @IsOptional()
    @IsString()
    role?: string;
  
    @ApiProperty({ description: 'Filter by status', required: false })
    @IsOptional()
    @IsString()
    status?: string;
  
    @ApiProperty({ description: 'Sort field', required: false, default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';
  
    @ApiProperty({ description: 'Sort order', required: false, default: 'DESC' })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
  }