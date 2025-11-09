import { api } from '@/lib/api/axios';
import { IRepositoryState } from '@/types/git';

export type PracticeRepoStateRecord = {
  state: IRepositoryState | null;
  version: number;
};

export class PracticeRepoStateService {
  static async get(practiceId: string): Promise<PracticeRepoStateRecord> {
    const res = await api.get(`/api/v1/practices/${practiceId}/repository-state`);
    return res.data as PracticeRepoStateRecord;
  }

  static async upsert(practiceId: string, payload: { state: IRepositoryState; version?: number }): Promise<PracticeRepoStateRecord> {
    const res = await api.put(`/api/v1/practices/${practiceId}/repository-state`, payload);
    return res.data as PracticeRepoStateRecord;
  }

  static async remove(practiceId: string): Promise<void> {
    await api.delete(`/api/v1/practices/${practiceId}/repository-state`);
  }
}


