import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { QuizAggregateService } from './services/quiz-aggregate.service';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { GetQuizzesQueryDto } from './dto/get-quizzes.query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForAdmin } from '../auth/decorators/roles.decorator';
import { AdminOrProGuard } from '../subscription/guards/admin-or-pro.guard';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController {
    constructor(
        private readonly quizAggregateService: QuizAggregateService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get quizzes with flexible filtering' })
    @ApiResponse({ status: 200, description: 'List of quizzes or single quiz' })
    async getQuizzes(@Query() query: GetQuizzesQueryDto) {
        return this.quizAggregateService.getQuizzes(query);
    }

    @Post()
    @UseGuards(JwtAuthGuard, AdminOrProGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new quiz (Admin or Pro subscription required)' })
    @ApiResponse({ status: 201, description: 'The created quiz' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role or Pro subscription required' })
    async createQuiz(@Body() createQuizDTO: CreateQuizDTO) {
        return this.quizAggregateService.createQuiz(createQuizDTO);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ForAdmin()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing quiz (Admin only)' })
    @ApiResponse({ status: 200, description: 'The updated quiz' })
    @ApiResponse({ status: 404, description: 'Quiz not found' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async updateQuiz(
        @Param('id') id: string,
        @Body() updateQuizDTO: UpdateQuizDTO
    ) {
        return this.quizAggregateService.updateQuiz(id, updateQuizDTO);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ForAdmin()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete a quiz (Admin only)' })
    @ApiResponse({ status: 200, description: 'Quiz successfully deleted' })
    @ApiResponse({ status: 404, description: 'Quiz not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async deleteQuiz(@Param('id') id: string) {
        return this.quizAggregateService.deleteQuiz(id);
    }

    @Post(':id/view')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Increment view count for a quiz' })
    @ApiResponse({ status: 204, description: 'View count incremented' })
    async incrementViews(@Param('id') id: string) {
        await this.quizAggregateService.incrementViews(id);
    }

    @Post(':id/complete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Increment completion count for a quiz' })
    @ApiResponse({ status: 204, description: 'Completion count incremented' })
    async incrementCompletions(@Param('id') id: string) {
        await this.quizAggregateService.incrementCompletions(id);
    }
}
