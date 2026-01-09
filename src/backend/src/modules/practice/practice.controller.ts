import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PracticeAggregateService } from './services/practice-aggregate.service';
import { CreatePracticeDTO } from './dto/create-practice.dto';
import { UpdatePracticeDTO } from './dto/update-practice.dto';
import { GetPracticesQueryDto } from './dto/get-practices.query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RepositoryStateDto } from './dto/repository-state.dto';
import { PracticeRepositoryStateService } from './services/practice-repository-state.service';
import { PracticeAiAssistantService } from './services/practice-ai-assistant.service';
import {
  AiAssistantRequestBodyDto,
  AiAssistantResponseDto,
} from './dto/ai-assistant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForAdmin } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequestDto } from '../auth/dto/authenticated-request.dto';
import { AdminOrProGuard } from '../subscription/guards/admin-or-pro.guard';

@ApiTags('Practices')
@Controller('practices')
export class PracticeController {
  constructor(
    private readonly practiceAggregateService: PracticeAggregateService,
    private readonly practiceRepoStateService: PracticeRepositoryStateService,
    private readonly practiceAiAssistantService: PracticeAiAssistantService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get practices with flexible filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of practices or single practice',
  })
  async getPractices(@Query() query: GetPracticesQueryDto) {
    return this.practiceAggregateService.getPractices(query);
  }

  @Get('lesson/:lessonSlug')
  @ApiOperation({ summary: 'Get practices of a lesson (without relations)' })
  @ApiResponse({
    status: 200,
    description: 'List of practices for the lesson',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getPracticesOfLesson(@Param('lessonSlug') lessonSlug: string) {
    return await this.practiceAggregateService.getPracticesOfLesson(lessonSlug);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get practice details with full relations' })
  @ApiResponse({
    status: 200,
    description: 'Practice with all relations (instructions, hints, etc.)',
  })
  @ApiResponse({ status: 404, description: 'Practice not found' })
  async getPracticeDetails(@Param('id') id: string) {
    return await this.practiceAggregateService.getPracticeDetails(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminOrProGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new practice (Admin or Pro subscription required)',
  })
  @ApiResponse({ status: 201, description: 'The created practice' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role or Pro subscription required',
  })
  async createPractice(@Body() createPracticeDTO: CreatePracticeDTO) {
    return this.practiceAggregateService.createPractice(createPracticeDTO);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ForAdmin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing practice (Admin only)' })
  @ApiResponse({ status: 200, description: 'The updated practice' })
  @ApiResponse({ status: 404, description: 'Practice not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updatePractice(
    @Param('id') id: string,
    @Body() updatePracticeDTO: UpdatePracticeDTO,
  ) {
    return this.practiceAggregateService.updatePractice(id, updatePracticeDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ForAdmin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a practice (Admin only)' })
  @ApiResponse({ status: 200, description: 'Practice successfully deleted' })
  @ApiResponse({ status: 404, description: 'Practice not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deletePractice(@Param('id') id: string) {
    return this.practiceAggregateService.deletePractice(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment view count for a practice' })
  @ApiResponse({ status: 204, description: 'View count incremented' })
  async incrementViews(@Param('id') id: string) {
    await this.practiceAggregateService.incrementViews(id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment completion count for a practice' })
  @ApiResponse({ status: 204, description: 'Completion count incremented' })
  async incrementCompletions(@Param('id') id: string) {
    await this.practiceAggregateService.incrementCompletions(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/repository-state')
  @ApiOperation({
    summary: "Get current user's repository state for this practice",
  })
  async getRepositoryState(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequestDto,
  ) {
    const userId = req.user.sub;
    return this.practiceRepoStateService.get(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id/repository-state')
  @ApiOperation({
    summary: "Upsert current user's repository state for this practice",
  })
  async upsertRepositoryState(
    @Param('id') id: string,
    @Body() body: RepositoryStateDto & { version?: number },
    @Req() req: AuthenticatedRequestDto,
  ) {
    const userId = req.user.sub;
    return this.practiceRepoStateService.upsert(
      id,
      userId,
      body as any,
      body.version,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/repository-state')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete current user's repository state for this practice",
  })
  async deleteRepositoryState(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequestDto,
  ) {
    const userId = req.user.sub;
    await this.practiceRepoStateService.remove(id, userId);
  }

  @Post(':id/ai-assistant')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }),
  )
  @ApiOperation({
    summary: '🤖 Trợ lý AI – Hỗ trợ Thực hành Git',
    description:
      'Nhận câu hỏi từ người học và trả lời dựa trên trạng thái Git hiện tại',
  })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi từ AI Assistant',
    type: AiAssistantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Practice not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAiAssistantResponse(
    @Param('id') id: string,
    @Body() body: AiAssistantRequestBodyDto,
  ): Promise<AiAssistantResponseDto> {
    try {
      return await this.practiceAiAssistantService.getAiResponse({
        ...body,
        practiceId: id,
      });
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      throw error;
    }
  }
}
