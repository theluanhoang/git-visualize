import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GitEngineService } from './git-engine.service';
import type { GitCommandRequest, GitCommandResponse, PracticeValidationResponse, IRepositoryState } from './git-engine.interface';
import { PracticeValidationDto } from './dto/practice-validation.dto';

@ApiTags('Git Engine')
@Controller('git')
export class GitEngineController {
    constructor(private readonly gitEngineService: GitEngineService) {}

    @Post('execute')
    @ApiOperation({ summary: 'Execute a git command in the engine' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                command: { type: 'string', example: 'git init' },
                repositoryState: { type: 'object', nullable: true }
            },
            required: ['command']
        }
    })
    @ApiResponse({ status: 200, description: 'Command executed', schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            output: { type: 'string', example: 'Initialized empty Git repository' },
            repositoryState: { type: 'object', nullable: true }
        }
    }})
    executeCommand(@Body() request: GitCommandRequest): GitCommandResponse | null {
        const result = this.gitEngineService.executeCommandWithState(request.repositoryState, request.command)
        console.log("RESULT:::", JSON.stringify(result));
            
        return result;
    }

    @Post('validate-practice')
    @ApiOperation({ summary: 'Validate user repositoryState against the practice goalRepositoryState' })
    @ApiBody({ type: PracticeValidationDto })
    @ApiResponse({ status: 200, description: 'Validation result returned' })
    async validatePractice(@Body() request: PracticeValidationDto): Promise<PracticeValidationResponse> {
        const userState = request.userRepositoryState as unknown as IRepositoryState;
        const result = await this.gitEngineService.validatePractice(request.practiceId, userState);
        console.log("VALIDATION RESULT:::", JSON.stringify(result));
        
        return result;
    }
}
