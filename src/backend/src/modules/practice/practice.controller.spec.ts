/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { PracticeController } from './practice.controller';
import { PracticeAggregateService } from './services/practice-aggregate.service';
import { PracticeRepositoryStateService } from './services/practice-repository-state.service';

describe('PracticeController', () => {
  let controller: PracticeController;
  let aggService: jest.Mocked<PracticeAggregateService>;
  let repoStateService: jest.Mocked<PracticeRepositoryStateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeController],
      providers: [
        { provide: PracticeAggregateService, useValue: {
          getPractices: jest.fn(),
          createPractice: jest.fn(),
          updatePractice: jest.fn(),
          deletePractice: jest.fn(),
          incrementViews: jest.fn(),
          incrementCompletions: jest.fn(),
        } },
        { provide: PracticeRepositoryStateService, useValue: {
          get: jest.fn(),
          upsert: jest.fn(),
          remove: jest.fn(),
        } },
      ],
    }).compile();

    controller = module.get(PracticeController);
    aggService = module.get(PracticeAggregateService);
    repoStateService = module.get(PracticeRepositoryStateService);
  });

  it('getPractices forwards', async () => {
    aggService.getPractices.mockResolvedValue({ items: [], total: 0 } as any);
    const res = await controller.getPractices({} as any);
    expect(res).toEqual({ items: [], total: 0 });
  });

  it('create/update/delete practice', async () => {
    aggService.createPractice.mockResolvedValue({ id: 'p1' } as any);
    expect(await controller.createPractice({} as any)).toEqual({ id: 'p1' });
    aggService.updatePractice.mockResolvedValue({ id: 'p1', name: 'n' } as any);
    expect(await controller.updatePractice('p1', {} as any)).toEqual({ id: 'p1', name: 'n' });
    aggService.deletePractice.mockResolvedValue({ success: true } as any);
    expect(await controller.deletePractice('p1')).toEqual({ success: true });
  });

  it('updatePractice propagates not found', async () => {
    aggService.updatePractice.mockRejectedValue(new Error('not found'));
    await expect(controller.updatePractice('missing', {} as any)).rejects.toThrow('not found');
  });

  it('deletePractice propagates not found', async () => {
    aggService.deletePractice.mockRejectedValue(new Error('not found'));
    await expect(controller.deletePractice('missing')).rejects.toThrow('not found');
  });

  it('increment views/completions', async () => {
    aggService.incrementViews.mockResolvedValue(undefined);
    await controller.incrementViews('p1');
    expect(aggService.incrementViews).toHaveBeenCalledWith('p1');
    aggService.incrementCompletions.mockResolvedValue(undefined);
    await controller.incrementCompletions('p1');
    expect(aggService.incrementCompletions).toHaveBeenCalledWith('p1');
  });

  it('increment endpoints propagate errors', async () => {
    aggService.incrementViews.mockRejectedValue(new Error('bad id'));
    await expect(controller.incrementViews('bad')).rejects.toThrow('bad id');
    aggService.incrementCompletions.mockRejectedValue(new Error('bad id'));
    await expect(controller.incrementCompletions('bad')).rejects.toThrow('bad id');
  });

  it('repository state get/upsert/delete', async () => {
    repoStateService.get.mockResolvedValue({ state: {} } as any);
    const g = await controller.getRepositoryState('p1', { user: { sub: 'u1' } } as any);
    expect(g).toEqual({ state: {} });

    repoStateService.upsert.mockResolvedValue({ ok: true } as any);
    const u = await controller.upsertRepositoryState('p1', { version: 1 } as any, { user: { sub: 'u1' } } as any);
    expect(u).toEqual({ ok: true });

    repoStateService.remove.mockResolvedValue(undefined);
    await controller.deleteRepositoryState('p1', { user: { sub: 'u1' } } as any);
    expect(repoStateService.remove).toHaveBeenCalledWith('p1', 'u1');
  });

  it('repository state upsert/remove error propagation', async () => {
    repoStateService.upsert.mockRejectedValue(new Error('version conflict'));
    await expect(
      controller.upsertRepositoryState('p1', { version: 2 } as any, { user: { sub: 'u1' } } as any)
    ).rejects.toThrow('version conflict');

    repoStateService.remove.mockRejectedValue(new Error('not found'));
    await expect(controller.deleteRepositoryState('p1', { user: { sub: 'u1' } } as any)).rejects.toThrow('not found');
  });
});





