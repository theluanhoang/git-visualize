import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ELessonStatus } from "../lesson.interface";

export class CreateLessonDTO {
    @IsString()
    @ApiProperty({ description: "The main content of the git theory", example: "This is the main content about git theory" })
    content: string;

    @IsString()
    @ApiProperty({ description: "The title of the git theory", example: "Introduction to Git" })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: "Optional description of the git theory", required: false, example: "A brief overview of git concepts" })
    description?: string;

    @IsString()
    @ApiProperty({ description: "Unique slug for the git theory", example: "intro-to-git" })
    slug: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: "Optional practice content related to the git theory", required: false, example: "Try creating a new git repository" })
    practice?: string;

    @IsEnum(ELessonStatus)
    @ApiProperty({ description: "Status of the git theory", example: "DRAFT" })
    status: ELessonStatus;
}