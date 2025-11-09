/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: {
          getCurrentUserProfile: jest.fn(),
          updateCurrentUserProfile: jest.fn(),
          getCurrentUserStats: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(UserController);
    userService = module.get(UserService);
  });

  it('getCurrentUser proxies with sub', async () => {
    userService.getCurrentUserProfile.mockResolvedValue({ id: 'u1' } as any);
    const res = await controller.getCurrentUser({ user: { sub: 'u1' } } as any);
    expect(res).toEqual({ id: 'u1' });
  });

  it('updateCurrentUser proxies with sub and body', async () => {
    userService.updateCurrentUserProfile.mockResolvedValue({ id: 'u1', name: 'n' } as any);
    const res = await controller.updateCurrentUser({ user: { sub: 'u1' } } as any, { name: 'n' } as any);
    expect(res).toEqual({ id: 'u1', name: 'n' });
  });

  it('getUserStats proxies with sub', async () => {
    userService.getCurrentUserStats.mockResolvedValue({ lessonsViewed: 1 } as any);
    const res = await controller.getUserStats({ user: { sub: 'u1' } } as any);
    expect(res).toEqual({ lessonsViewed: 1 });
  });
});





