import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get public stats for landing page' })
  @ApiResponse({ status: 200, description: 'Public stats retrieved' })
  async getPublicStats(@Query('includeUsers') includeUsers?: string) {
    const includeUsersBool = includeUsers === '1';
    return this.publicService.getPublicStats({ includeUsers: includeUsersBool });
  }
}


