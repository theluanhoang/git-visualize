/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { GitEngineController } from './git-engine.controller';
import { GitEngineService } from './git-engine.service';

describe('GitEngineController', () => {
  let controller: GitEngineController;
  let service: jest.Mocked<GitEngineService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitEngineController],
      providers: [
        { provide: GitEngineService, useValue: {
          executeCommandWithState: jest.fn(),
          validatePractice: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(GitEngineController);
    service = module.get(GitEngineService);
  });

  it('executeCommand forwards to service', () => {
    service.executeCommandWithState.mockReturnValue({ success: true, output: 'ok', repositoryState: {} } as any);
    const res = controller.executeCommand({ command: 'git init', repositoryState: {} } as any);
    expect(res).toEqual({ success: true, output: 'ok', repositoryState: {} });
    expect(service.executeCommandWithState).toHaveBeenCalledWith({}, 'git init');
  });

  it('executeCommand returns null when service returns null', () => {
    service.executeCommandWithState.mockReturnValue(null as any);
    const res = controller.executeCommand({ command: 'git status', repositoryState: {} } as any);
    expect(res).toBeNull();
  });

  it('executeCommand propagates service errors', () => {
    service.executeCommandWithState.mockImplementation(() => { throw new Error('bad command'); });
    expect(() => controller.executeCommand({ command: 'git ???', repositoryState: {} } as any)).toThrow('bad command');
  });

  it('executeCommand handles missing repositoryState', () => {
    service.executeCommandWithState.mockReturnValue({ success: true, output: 'ok', repositoryState: {} } as any);
    const res = controller.executeCommand({ command: 'git init' } as any);
    expect(service.executeCommandWithState).toHaveBeenCalledWith(undefined, 'git init');
    expect(res?.success).toBe(true);
  });

  it('validatePractice propagates service errors', async () => {
    service.validatePractice.mockRejectedValue(new Error('practice not found'));
    await expect(controller.validatePractice({ practiceId: 'missing', userRepositoryState: {} } as any)).rejects.toThrow('practice not found');
  });

  it('validatePractice returns detailed diff when invalid', async () => {
    service.validatePractice.mockResolvedValue({ valid: false, diffs: [{ path: 'branch', expected: 'main', actual: 'dev' }] } as any);
    const res = await controller.validatePractice({ practiceId: 'p1', userRepositoryState: {} } as any);
    expect(res).toEqual({ valid: false, diffs: [{ path: 'branch', expected: 'main', actual: 'dev' }] });
  });

  it('validatePractice forwards and returns', async () => {
    service.validatePractice.mockResolvedValue({ valid: true } as any);
    const res = await controller.validatePractice({ practiceId: 'p1', userRepositoryState: {} } as any);
    expect(res).toEqual({ valid: true });
    expect(service.validatePractice).toHaveBeenCalledWith('p1', {} as any);
  });
});





