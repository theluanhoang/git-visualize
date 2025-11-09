/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { ConfigService } from '@nestjs/config';

describe('OAuthController', () => {
  let controller: OAuthController;
  let oauthService: jest.Mocked<OAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [
        { provide: OAuthService, useValue: {
          validateOAuthConfiguration: jest.fn(),
          validateOAuthUser: jest.fn(),
          buildOAuthRedirectUrl: jest.fn(),
          unlinkOAuthProviderWithValidation: jest.fn(),
        } },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get(OAuthController);
    oauthService = module.get(OAuthService);
  });

  it('googleAuth should validate config', async () => {
    oauthService.validateOAuthConfiguration.mockResolvedValue(undefined);
    await controller.googleAuth({} as any);
    expect(oauthService.validateOAuthConfiguration).toHaveBeenCalledWith('google');
  });

  it('googleAuth propagates config error', async () => {
    oauthService.validateOAuthConfiguration.mockRejectedValue(new Error('not configured'));
    await expect(controller.googleAuth({} as any)).rejects.toThrow('not configured');
  });

  it('githubAuth should validate config', async () => {
    oauthService.validateOAuthConfiguration.mockResolvedValue(undefined);
    await controller.githubAuth({} as any);
    expect(oauthService.validateOAuthConfiguration).toHaveBeenCalledWith('github');
  });

  it('facebookAuth should validate config', async () => {
    oauthService.validateOAuthConfiguration.mockResolvedValue(undefined);
    await controller.facebookAuth({} as any);
    expect(oauthService.validateOAuthConfiguration).toHaveBeenCalledWith('facebook');
  });

  it('google callback should redirect with built url', async () => {
    oauthService.validateOAuthUser = jest.fn().mockResolvedValue({ tokens: {} });
    oauthService.buildOAuthRedirectUrl = jest.fn().mockResolvedValue('https://redirect');
    const res = { redirect: jest.fn() } as any;
    const req: any = { user: { id: 'u1', locale: 'vi' }, get: () => 'UA', ip: '1.1.1.1' };
    await controller.googleAuthCallback(req, res);
    expect(oauthService.validateOAuthUser).toHaveBeenCalled();
    expect(oauthService.buildOAuthRedirectUrl).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('https://redirect');
  });

  it('google callback falls back locale to en', async () => {
    oauthService.validateOAuthUser = jest.fn().mockResolvedValue({ tokens: {} });
    oauthService.buildOAuthRedirectUrl = jest.fn().mockResolvedValue('https://redir');
    const res = { redirect: jest.fn() } as any;
    const req: any = { user: { id: 'u1' }, get: () => 'UA', ip: '1.1.1.1' };
    await controller.googleAuthCallback(req, res);
    expect(oauthService.buildOAuthRedirectUrl).toHaveBeenCalledWith({ tokens: {} }, 'en');
    expect(res.redirect).toHaveBeenCalledWith('https://redir');
  });

  it('callback propagates service errors', async () => {
    oauthService.validateOAuthUser = jest.fn().mockRejectedValue(new Error('oauth failed'));
    const res = { redirect: jest.fn() } as any;
    const req: any = { user: { id: 'u1' }, get: () => 'UA', ip: '1.1.1.1' };
    await expect(controller.githubAuthCallback(req, res)).rejects.toThrow('oauth failed');
  });

  it('github callback should redirect', async () => {
    oauthService.validateOAuthUser = jest.fn().mockResolvedValue({ tokens: {} });
    oauthService.buildOAuthRedirectUrl = jest.fn().mockResolvedValue('https://redirect2');
    const res = { redirect: jest.fn() } as any;
    const req: any = { user: { id: 'u2' }, get: () => 'UA', ip: '2.2.2.2' };
    await controller.githubAuthCallback(req, res);
    expect(res.redirect).toHaveBeenCalledWith('https://redirect2');
  });

  it('facebook callback should redirect', async () => {
    oauthService.validateOAuthUser = jest.fn().mockResolvedValue({ tokens: {} });
    oauthService.buildOAuthRedirectUrl = jest.fn().mockResolvedValue('https://redirect3');
    const res = { redirect: jest.fn() } as any;
    const req: any = { user: { id: 'u3' }, get: () => 'UA', ip: '3.3.3.3' };
    await controller.facebookAuthCallback(req, res);
    expect(res.redirect).toHaveBeenCalledWith('https://redirect3');
  });

  it('unlink should call service with user id and provider', async () => {
    oauthService.unlinkOAuthProviderWithValidation.mockResolvedValue({ ok: true } as any);
    const result = await controller.unlinkProvider({ user: { sub: 'u1' } } as any, 'google');
    expect(result).toEqual({ ok: true });
    expect(oauthService.unlinkOAuthProviderWithValidation).toHaveBeenCalledWith('u1', 'google');
  });

  it('unlink propagates service error', async () => {
    oauthService.unlinkOAuthProviderWithValidation.mockRejectedValue(new Error('unknown provider'));
    await expect(controller.unlinkProvider({ user: { sub: 'u1' } } as any, 'twitter')).rejects.toThrow('unknown provider');
  });
});





