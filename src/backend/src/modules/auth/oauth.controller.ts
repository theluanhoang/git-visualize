import { Controller, Get, Post, Req, Res, UseGuards, Body, Param, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { OAuthLoginResponseDto } from './dto/oauth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('OAuth Authentication')
@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private oauthService: OAuthService,
    private configService: ConfigService,
  ) {}


  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured' })
  async googleAuth(@Req() req: Request) {
    await this.oauthService.validateOAuthConfiguration('google');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful', type: OAuthLoginResponseDto })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userInfo = req.user as any;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    const result = await this.oauthService.validateOAuthUser(userInfo, userAgent, ip);
    
    const redirectUrl = await this.oauthService.buildOAuthRedirectUrl(result, userInfo.locale || 'en');
    res.redirect(redirectUrl);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  @ApiResponse({ status: 400, description: 'GitHub OAuth not configured' })
  async githubAuth(@Req() req: Request) {
    await this.oauthService.validateOAuthConfiguration('github');
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful', type: OAuthLoginResponseDto })
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userInfo = req.user as any;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    const result = await this.oauthService.validateOAuthUser(userInfo, userAgent, ip);
    
    const redirectUrl = await this.oauthService.buildOAuthRedirectUrl(result, userInfo.locale || 'en');
    res.redirect(redirectUrl);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth' })
  @ApiResponse({ status: 400, description: 'Facebook OAuth not configured' })
  async facebookAuth(@Req() req: Request) {
    await this.oauthService.validateOAuthConfiguration('facebook');
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Handle Facebook OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful', type: OAuthLoginResponseDto })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userInfo = req.user as any;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress;
    const result = await this.oauthService.validateOAuthUser(userInfo, userAgent, ip);
    
    const redirectUrl = await this.oauthService.buildOAuthRedirectUrl(result, userInfo.locale || 'en');
    res.redirect(redirectUrl);
  }

  @Post('unlink/:provider')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink OAuth provider from user account' })
  @ApiResponse({ status: 200, description: 'OAuth provider unlinked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unlinkProvider(
    @Req() req: Request,
    @Param('provider') provider: string,
  ) {
    const userId = req.user?.['sub'];
    return this.oauthService.unlinkOAuthProviderWithValidation(userId, provider);
  }
}
