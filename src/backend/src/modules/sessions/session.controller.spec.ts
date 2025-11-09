/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let sessionService: jest.Mocked<SessionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        { provide: SessionService, useValue: {
          getActiveSessionsWithDetails: jest.fn(),
          getOAuthSessionsWithDetails: jest.fn(),
          getDeviceInfo: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(SessionController);
    sessionService = module.get(SessionService);
  });

  it('getActiveSessions forwards with user sub', async () => {
    sessionService.getActiveSessionsWithDetails.mockResolvedValue({ items: [] } as any);
    const res = await controller.getActiveSessions({ user: { sub: 'u1' } } as any);
    expect(res).toEqual({ items: [] });
  });

  it('getActiveSessions propagates errors', async () => {
    sessionService.getActiveSessionsWithDetails.mockRejectedValue(new Error('db error'));
    await expect(controller.getActiveSessions({ user: { sub: 'u1' } } as any)).rejects.toThrow('db error');
  });

  it('getOAuthSessions forwards', async () => {
    sessionService.getOAuthSessionsWithDetails.mockResolvedValue({ items: [] } as any);
    const res = await controller.getOAuthSessions({ user: { sub: 'u1' } } as any);
    expect(res).toEqual({ items: [] });
  });

  it('getOAuthSessions propagates errors', async () => {
    sessionService.getOAuthSessionsWithDetails.mockRejectedValue(new Error('db error'));
    await expect(controller.getOAuthSessions({ user: { sub: 'u1' } } as any)).rejects.toThrow('db error');
  });

  it('getCurrentDeviceInfo forwards user agent and ip', async () => {
    sessionService.getDeviceInfo.mockResolvedValue({ ua: 'UA', ip: '1.1.1.1' } as any);
    const req: any = { get: () => 'UA', ip: '1.1.1.1', connection: { remoteAddress: 'fallback' } };
    const res = await controller.getCurrentDeviceInfo(req);
    expect(res).toEqual({ ua: 'UA', ip: '1.1.1.1' });
    expect(sessionService.getDeviceInfo).toHaveBeenCalledWith('UA', '1.1.1.1');
  });

  it('getCurrentDeviceInfo handles undefined UA/IP', async () => {
    sessionService.getDeviceInfo.mockResolvedValue({ ua: undefined, ip: undefined } as any);
    const req: any = { get: () => undefined, ip: undefined, connection: { remoteAddress: undefined } };
    const res = await controller.getCurrentDeviceInfo(req);
    expect(res).toEqual({ ua: undefined, ip: undefined });
    expect(sessionService.getDeviceInfo).toHaveBeenCalledWith(undefined, undefined);
  });
});





