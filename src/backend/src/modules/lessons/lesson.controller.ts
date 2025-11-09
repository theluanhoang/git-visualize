import { Body, Controller, Get, Post, Patch, Param, Query, Delete, UseInterceptors, UploadedFile, BadRequestException, ValidationPipe, UsePipes, UseGuards, ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessonService } from './lesson.service';
import { CreateLessonDTO } from './dto/create-lesson.dto';
import { GetLessonsQueryDto } from './dto/get-lessons.query.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Lesson } from './lesson.entity';
import { UpdateLessonDTO } from './dto/update-lesson.dto';
import { GetLessonsResponse, LessonWithPractices } from './types';
import { GenerateLessonResponseDto, Language, ModelType, OutlineStyle, SourceType } from './dto/generate-lesson.dto';
import { GenerateLessonMultipartDto } from './dto/generate-lesson-multipart.dto';
import { LessonGenerationService } from './services/lesson-generation.service';
import { LessonViewService } from './lesson-view.service';
import { TrackLessonViewDto } from './dto/track-lesson-view.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';
import { RatingService } from './rating.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto, LessonRatingStatsDto, UserInfoDto } from './dto/rating-response.dto';
import { RatingGateway } from './rating.gateway';

@ApiTags('Lessons')
@Controller('lesson')
export class LessonController {
    private mapRatingToResponse(rating: any): RatingResponseDto {
        return {
            id: rating.id,
            userId: rating.userId,
            lessonId: rating.lessonId,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            user: rating.user ? {
                id: rating.user.id,
                email: rating.user.email,
                firstName: rating.user.firstName,
                lastName: rating.user.lastName,
                avatar: rating.user.avatar,
            } : undefined,
        };
    }
    constructor(
        private readonly lessonService: LessonService,
        private readonly lessonGenerationService: LessonGenerationService,
        private readonly lessonViewService: LessonViewService,
        private readonly ratingService: RatingService,
        private readonly ratingGateway: RatingGateway,
    ) {}

    @Get()
    @ApiOkResponse({ description: 'List lessons with pagination' })
    async getLessons(@Query() query: GetLessonsQueryDto): Promise<GetLessonsResponse<Lesson | LessonWithPractices>> {
        return this.lessonService.getLessons(query);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new lesson' })
    @ApiCreatedResponse({ description: 'Lesson created', type: Lesson })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    async createLesson(@Body() createGitTheoryDto: CreateLessonDTO) {
        return this.lessonService.createLesson(createGitTheoryDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a lesson by id' })
    @ApiOkResponse({ description: 'Lesson updated', type: Lesson })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDTO) {
        return this.lessonService.updateLesson(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a lesson by id (soft delete)' })
    @ApiOkResponse({ description: 'Lesson deleted' })
    async deleteLesson(@Param('id') id: string) {
        return this.lessonService.deleteLesson(id);
    }

    @Post('generate')
    @UseInterceptors(FileInterceptor('file'))
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiOperation({ summary: 'Generate lesson content from URL or file' })
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiOkResponse({ description: 'Lesson content generated successfully', type: GenerateLessonResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid input or generation failed' })
    async generateLesson(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: GenerateLessonMultipartDto,
    ): Promise<GenerateLessonResponseDto> {     
        const { sourceType, url, language, model, outlineStyle, additionalInstructions } = body;

        if (sourceType === SourceType.FILE) {
            if (!file) {
                throw new BadRequestException('File is required when sourceType is file');
            }
            return this.lessonGenerationService.generateLesson({
                sourceType,
                fileBuffer: file.buffer,
                fileName: file.originalname,
                language: language || Language.VI,
                model: model || ModelType.GEMINI_FLASH,
                outlineStyle: outlineStyle || OutlineStyle.DETAILED,
                additionalInstructions,
            });
        } else if (sourceType === SourceType.URL) {
            if (!url) {
                throw new BadRequestException('URL is required when sourceType is url');
            }
            return this.lessonGenerationService.generateLesson({
                sourceType,
                url,
                language: language || Language.VI,
                model: model || ModelType.GEMINI_FLASH,
                outlineStyle: outlineStyle || OutlineStyle.DETAILED,
                additionalInstructions,
            });
        } else {
            throw new BadRequestException('Invalid source type');
        }
    }

    @Post('track-view')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Track a lesson view for authenticated user' })
    @ApiOkResponse({ description: 'Lesson view tracked successfully' })
    @ApiBadRequestResponse({ description: 'Invalid lesson ID' })
    async trackLessonView(@UserId() userId: string, @Body() dto: TrackLessonViewDto) {
        return this.lessonViewService.trackLessonView(userId, dto.lessonId);
    }

    @Get('my-views')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get lesson views for authenticated user' })
    @ApiOkResponse({ description: 'User lesson views retrieved successfully' })
    async getMyLessonViews(
        @UserId() userId: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Query('orderBy') orderBy?: 'viewedAt' | 'lastViewedAt' | 'viewCount',
        @Query('order') order?: 'ASC' | 'DESC',
    ) {
        return this.lessonViewService.getUserLessonViews(userId, {
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            orderBy,
            order,
        });
    }

    @Get(':id/view-stats')
    @ApiOperation({ summary: 'Get view statistics for a specific lesson' })
    @ApiOkResponse({ description: 'Lesson view statistics retrieved successfully' })
    async getLessonViewStats(@Param('id') id: string) {
        return this.lessonViewService.getLessonViewStats(id);
    }

    @Get(':id/has-viewed')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Check if authenticated user has viewed a specific lesson' })
    @ApiOkResponse({ description: 'Check result retrieved successfully' })
    async hasUserViewedLesson(@UserId() userId: string, @Param('id') id: string) {
        const hasViewed = await this.lessonViewService.hasUserViewedLesson(userId, id);
        const viewCount = await this.lessonViewService.getUserLessonViewCount(userId, id);
        return {
            hasViewed,
            viewCount,
        };
    }

    @Post(':id/rating')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create or update rating for a lesson' })
    @ApiCreatedResponse({ description: 'Rating created successfully', type: RatingResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid rating value or lesson not found' })
    async createRating(
        @UserId() userId: string,
        @Param('id') lessonId: string,
        @Body() dto: CreateRatingDto,
    ): Promise<RatingResponseDto> {
        try {
            await this.ratingService.createRating(userId, lessonId, dto);
            const ratingWithUser = await this.ratingService.getUserRating(userId, lessonId);
            const response = this.mapRatingToResponse(ratingWithUser!);
            
            this.ratingGateway.emitRatingCreated(lessonId, response);
            const stats = await this.ratingService.getLessonRatingStats(lessonId);
            this.ratingGateway.emitStatsUpdated(lessonId, stats);
            
            return response;
        } catch (error) {
            if (error instanceof ConflictException) {
                const rating = await this.ratingService.updateRating(userId, lessonId, dto);
                const ratingWithUser = await this.ratingService.getUserRating(userId, lessonId);
                const response = this.mapRatingToResponse(ratingWithUser!);
                
                this.ratingGateway.emitRatingUpdated(lessonId, response);
                const stats = await this.ratingService.getLessonRatingStats(lessonId);
                this.ratingGateway.emitStatsUpdated(lessonId, stats);
                
                return response;
            }
            throw error;
        }
    }

    @Patch(':id/rating')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update rating for a lesson' })
    @ApiOkResponse({ description: 'Rating updated successfully', type: RatingResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid rating value or rating not found' })
    async updateRating(
        @UserId() userId: string,
        @Param('id') lessonId: string,
        @Body() dto: UpdateRatingDto,
    ): Promise<RatingResponseDto> {
        await this.ratingService.updateRating(userId, lessonId, dto);
        const rating = await this.ratingService.getUserRating(userId, lessonId);
        const response = this.mapRatingToResponse(rating!);
        
        this.ratingGateway.emitRatingUpdated(lessonId, response);
        const stats = await this.ratingService.getLessonRatingStats(lessonId);
        this.ratingGateway.emitStatsUpdated(lessonId, stats);
        
        return response;
    }

    @Delete(':id/rating')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete rating for a lesson' })
    @ApiOkResponse({ description: 'Rating deleted successfully' })
    @ApiBadRequestResponse({ description: 'Rating not found' })
    async deleteRating(@UserId() userId: string, @Param('id') lessonId: string) {
        await this.ratingService.deleteRating(userId, lessonId);
        
        this.ratingGateway.emitRatingDeleted(lessonId, userId);
        const stats = await this.ratingService.getLessonRatingStats(lessonId);
        this.ratingGateway.emitStatsUpdated(lessonId, stats);
        
        return { message: 'Rating deleted successfully' };
    }

    @Get(':id/rating')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get user rating for a lesson' })
    @ApiOkResponse({ description: 'User rating retrieved successfully', type: RatingResponseDto })
    async getUserRating(@UserId() userId: string, @Param('id') lessonId: string) {
        const rating = await this.ratingService.getUserRating(userId, lessonId);
        if (!rating) {
            return null;
        }
        return this.mapRatingToResponse(rating);
    }

    @Get(':id/rating/stats')
    @ApiOperation({ summary: 'Get rating statistics for a lesson' })
    @ApiOkResponse({ description: 'Rating statistics retrieved successfully', type: LessonRatingStatsDto })
    async getLessonRatingStats(@Param('id') lessonId: string): Promise<LessonRatingStatsDto> {
        return this.ratingService.getLessonRatingStats(lessonId);
    }

    @Get(':id/ratings')
    @ApiOperation({ summary: 'Get all ratings for a lesson' })
    @ApiOkResponse({ description: 'Ratings retrieved successfully', type: [RatingResponseDto] })
    async getLessonRatings(@Param('id') lessonId: string): Promise<RatingResponseDto[]> {
        const ratings = await this.ratingService.getLessonRatings(lessonId);
        return ratings.map((rating) => this.mapRatingToResponse(rating));
    }
}
