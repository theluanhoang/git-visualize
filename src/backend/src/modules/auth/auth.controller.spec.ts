/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should register', async () => {
    authService.register.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    const res = await controller.register({ email: 'a@b.com', password: 'x' } as any);
    expect(res).toEqual({ id: 'u1', email: 'a@b.com' });
    expect(authService.register).toHaveBeenCalledWith('a@b.com', 'x');
  });

  it('should login', async () => {
    authService.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const res = await controller.login({ email: 'a@b.com', password: 'x' } as any, 'UA', '127.0.0.1');
    expect(res).toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(authService.login).toHaveBeenCalledWith('a@b.com', 'x', 'UA', '127.0.0.1');
  });

  it('login should propagate errors from service', async () => {
    authService.login.mockRejectedValue(new Error('invalid credentials'));
    await expect(
      controller.login({ email: 'a@b.com', password: 'bad' } as any, 'UA', '127.0.0.1')
    ).rejects.toThrow('invalid credentials');
  });

  it('should refresh', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 'na', refreshToken: 'nr' });
    const res = await controller.refresh({ userId: 'u1', refreshToken: 'r1' } as any, 'UA', '1.1.1.1');
    expect(res).toEqual({ accessToken: 'na', refreshToken: 'nr' });
    expect(authService.refresh).toHaveBeenCalledWith('u1', 'r1', 'UA', '1.1.1.1');
  });

  it('refresh with missing body should not crash and forward undefineds', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 'na', refreshToken: 'nr' });
    const res = await controller.refresh(undefined as any, undefined as any, undefined as any);
    expect(authService.refresh).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    expect(res).toEqual({ accessToken: 'na', refreshToken: 'nr' });
  });

  it('logout propagates service errors', async () => {
    authService.logout.mockRejectedValue(new Error('invalid token'));
    await expect(controller.logout({ userId: 'u1', refreshToken: 'bad' } as any)).rejects.toThrow('invalid token');
  });

  it('should logout', async () => {
    authService.logout.mockResolvedValue({ revoked: true } as any);
    const res = await controller.logout({ userId: 'u1', refreshToken: 'r1' } as any);
    expect(res).toEqual({ revoked: true });
    expect(authService.logout).toHaveBeenCalledWith('u1', 'r1');
  });

  it('should return me from request', () => {
    const me = controller.me({ user: { sub: 'u1' } } as any);
    expect(me).toEqual({ sub: 'u1' });
  });

  it('should return null if no user on request', () => {
    const me = controller.me({} as any);
    expect(me).toBeNull();
  });
});





