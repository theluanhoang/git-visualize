/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserService } from '../users/user.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: {
          sendEmailToUser: jest.fn(),
          getDashboardStats: jest.fn(),
          getAnalyticsMetrics: jest.fn(),
          getDeviceUsageBreakdown: jest.fn(),
          getHourlyActivity: jest.fn(),
        } },
        { provide: UserService, useValue: {
          getUsers: jest.fn(),
          updateUserStatus: jest.fn(),
          deleteUser: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(AdminController);
    adminService = module.get(AdminService);
    userService = module.get(UserService);
  });

  it('getAllUsers should call userService.getUsers', async () => {
    userService.getUsers.mockResolvedValue({ items: [], total: 0 } as any);
    const res = await controller.getAllUsers({ page: 1, limit: 10 } as any);
    expect(res).toEqual({ items: [], total: 0 });
    expect(userService.getUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('getAllUsers passes through complex filters and sorts', async () => {
    userService.getUsers.mockResolvedValue({ items: [], total: 0 } as any);
    await controller.getAllUsers({ page: 2, limit: 50, search: 'john', role: 'admin', status: 'active', sortBy: 'email', sortOrder: 'DESC' } as any);
    expect(userService.getUsers).toHaveBeenCalledWith({ page: 2, limit: 50, search: 'john', role: 'admin', status: 'active', sortBy: 'email', sortOrder: 'DESC' });
  });

  it('updateUserStatus should call userService.updateUserStatus', async () => {
    userService.updateUserStatus.mockResolvedValue({ id: 'u1', isActive: true } as any);
    const res = await controller.updateUserStatus('u1', { isActive: true });
    expect(res).toEqual({ id: 'u1', isActive: true });
  });

  it('deleteUser returns success message', async () => {
    userService.deleteUser.mockResolvedValue(undefined);
    const res = await controller.deleteUser('u1');
    expect(res).toEqual({ message: 'User deleted successfully' });
    expect(userService.deleteUser).toHaveBeenCalledWith('u1');
  });

  it('sendEmailToUser returns message', async () => {
    adminService.sendEmailToUser.mockResolvedValue(undefined);
    const res = await controller.sendEmailToUser('u1', { subject: 's', message: 'm' } as any, []);
    expect(res).toEqual({ message: 'Email sent' });
    expect(adminService.sendEmailToUser).toHaveBeenCalled();
  });

  it('sendEmailToUser propagates service error', async () => {
    adminService.sendEmailToUser.mockRejectedValue(new Error('smtp error'));
    await expect(controller.sendEmailToUser('u1', { subject: 's', message: 'm' } as any, [])).rejects.toThrow('smtp error');
  });

  it('getDashboardStats should forward', async () => {
    adminService.getDashboardStats.mockResolvedValue({ a: 1 } as any);
    const res = await controller.getDashboardStats();
    expect(res).toEqual({ a: 1 });
  });

  it('getAnalyticsMetrics should forward', async () => {
    adminService.getAnalyticsMetrics.mockResolvedValue({ a: 2 } as any);
    const res = await controller.getAnalyticsMetrics();
    expect(res).toEqual({ a: 2 });
  });

  it('getDeviceUsage should forward', async () => {
    adminService.getDeviceUsageBreakdown.mockResolvedValue({ d: 1 } as any);
    const res = await controller.getDeviceUsage();
    expect(res).toEqual({ d: 1 });
  });

  it('getHourlyActivity should forward', async () => {
    adminService.getHourlyActivity.mockResolvedValue([{ h: 10, c: 1 }] as any);
    const res = await controller.getHourlyActivity('2025-01-01');
    expect(res).toEqual([{ h: 10, c: 1 }]);
  });

  it('getHourlyActivity handles undefined date', async () => {
    adminService.getHourlyActivity.mockResolvedValue([] as any);
    const res = await controller.getHourlyActivity(undefined);
    expect(res).toEqual([]);
  });

  it('updateUserStatus propagates service error', async () => {
    userService.updateUserStatus.mockRejectedValue(new Error('user not found'));
    await expect(controller.updateUserStatus('u1', { isActive: false })).rejects.toThrow('user not found');
  });

  it('deleteUser propagates service error', async () => {
    userService.deleteUser.mockRejectedValue(new Error('cannot delete'));
    await expect(controller.deleteUser('u1')).rejects.toThrow('cannot delete');
  });
});





