import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

// Dedicated enum for DTO validation (separate from service enums)
enum GitObjectTypeDto {
  BLOB = 'BLOB',
  TREE = 'TREE',
  COMMIT = 'COMMIT',
}

class AuthorDto {
  @ApiProperty({ example: 'You' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '<you@example.com>' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '2025-10-13T05:19:49.151Z' })
  @IsDateString()
  date!: string;
}

export class CommitDto {
  @ApiProperty({ example: '027a063fdabb5d25345df3f33ffa92ff9a33cc99' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ enum: ['BLOB', 'TREE', 'COMMIT'], example: 'COMMIT' })
  @IsEnum(GitObjectTypeDto)
  type!: GitObjectTypeDto;

  @ApiProperty({ required: false, example: undefined })
  @IsOptional()
  @IsString()
  tree?: string;

  @ApiProperty({ type: [String], example: ['ad10ca15e860dddcb6ef02682266da1a0e87e3eb'] })
  @IsArray()
  @IsString({ each: true })
  parents!: string[];

  @ApiProperty({ type: () => AuthorDto })
  @ValidateNested()
  @Type(() => AuthorDto)
  author!: AuthorDto;

  @ApiProperty({ type: () => AuthorDto })
  @ValidateNested()
  @Type(() => AuthorDto)
  committer!: AuthorDto;

  @ApiProperty({ example: '"feat"' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ example: 'main' })
  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class BranchDto {
  @ApiProperty({ example: 'main' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '027a063fdabb5d25345df3f33ffa92ff9a33cc99' })
  @IsString()
  commitId!: string;
}

export class TagDto {
  @ApiProperty({ example: 'v1.0.0' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '027a063fdabb5d25345df3f33ffa92ff9a33cc99' })
  @IsString()
  commitId!: string;
}

class HeadDto {
  @ApiProperty({ enum: ['branch', 'commit'], example: 'branch' })
  @IsIn(['branch', 'commit'])
  type!: 'branch' | 'commit';

  @ApiProperty({ example: 'main' })
  @IsString()
  @IsNotEmpty()
  ref!: string;

  @ApiProperty({ required: false, example: '027a063fdabb5d25345df3f33ffa92ff9a33cc99' })
  @IsOptional()
  @IsString()
  commitId?: string;
}

export class RepositoryStateDto {
  @ApiProperty({ type: () => [CommitDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitDto)
  commits!: CommitDto[];

  @ApiProperty({ type: () => [BranchDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BranchDto)
  branches!: BranchDto[];

  @ApiProperty({ type: () => [TagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags!: TagDto[];

  @ApiProperty({ required: false, nullable: true, type: () => HeadDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeadDto)
  head?: HeadDto | null;
}

export class PracticeValidationDto {
  @ApiProperty({ example: 'practice-id-uuid-or-string' })
  @IsString()
  @IsNotEmpty()
  practiceId!: string; // Keep string to allow UUID or snowflake ids

  @ApiProperty({ type: () => RepositoryStateDto })
  @ValidateNested()
  @Type(() => RepositoryStateDto)
  userRepositoryState!: RepositoryStateDto;
}


