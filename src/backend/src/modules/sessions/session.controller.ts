import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionService } from './session.service';
import { AuthenticatedRequestDto } from '../auth/dto/authenticated-request.dto';
import { ActiveSessionsResponseDto, OAuthSessionsResponseDto } from './dto/session-response.dto';
import { DeviceInfoResponseDto } from '../auth/dto/device-info.dto';

@ApiTags('User Sessions')
@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(
    private sessionService: SessionService,
  ) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved successfully', type: ActiveSessionsResponseDto })
  async getActiveSessions(@Req() req: AuthenticatedRequestDto): Promise<ActiveSessionsResponseDto> {
    const userId = req.user?.sub;
    return this.sessionService.getActiveSessionsWithDetails(userId);
  }

  @Get('oauth')
  @ApiOperation({ summary: 'Get OAuth sessions for current user' })
  @ApiResponse({ status: 200, description: 'OAuth sessions retrieved successfully', type: OAuthSessionsResponseDto })
  async getOAuthSessions(@Req() req: AuthenticatedRequestDto): Promise<OAuthSessionsResponseDto> {
    const userId = req.user?.sub;
    return this.sessionService.getOAuthSessionsWithDetails(userId);
  }

  @Get('device-info')
  @ApiOperation({ summary: 'Get device information for current session' })
  @ApiResponse({ status: 200, description: 'Device information retrieved successfully', type: DeviceInfoResponseDto })
  async getCurrentDeviceInfo(@Req() req: AuthenticatedRequestDto): Promise<DeviceInfoResponseDto> {
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection?.remoteAddress;
    return this.sessionService.getDeviceInfo(userAgent, ip);
  }
}
