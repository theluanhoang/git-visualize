import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

class AuthorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date!: string;
}

class CommitDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: ['BLOB','TREE','COMMIT'] })
  @IsString()
  type!: 'BLOB' | 'TREE' | 'COMMIT';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tree?: string;

  @ApiProperty({ type: [String] })
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

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty()
  @IsString()
  branch!: string;
}

class BranchDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  commitId!: string;
}

class TagDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  commitId!: string;
}

export enum HeadTypeDto {
  BRANCH = 'BRANCH',
  COMMIT = 'COMMIT',
}

class HeadDto {
  @ApiProperty({ enum: HeadTypeDto })
  @IsString()
  type!: HeadTypeDto;

  @ApiProperty()
  @IsString()
  ref!: string;

  @ApiProperty({ required: false })
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


