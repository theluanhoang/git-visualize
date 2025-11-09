import { useQuery } from '@tanstack/react-query';
import { LessonsService } from '@/services/lessons';
import { PracticesService } from '@/services/practices';
import api from '@/lib/api/axios';

export type PublicStats = {
  totalLessons: number;
  totalViews: number;
  totalPractices: number;
  totalUsers?: number;
};

async function fetchPublicStats(): Promise<PublicStats> {
  const allLessons: Array<{ id: string; views?: number }> = [];
  let offset = 0;
  const limit = 100;
  for (let page = 0; page < 50; page++) {
    const { data: lessonsPage, total } = await LessonsService.getAll({ limit, offset, status: 'published' });
    allLessons.push(...(lessonsPage || []));
    offset += limit;
    if (!lessonsPage || lessonsPage.length < limit) break;
    if (total && allLessons.length >= total) break;
  }

  const totalLessons = allLessons.length;
  const totalViews = allLessons.reduce((sum, l: any) => sum + (l?.views || 0), 0);

  const lessonIdSet = new Set(allLessons.map((l: any) => String(l.id)));

  const allPractices: Array<{ lessonId?: string }> = [];
  let pOffset = 0;
  const pLimit = 200;
  for (let page = 0; page < 50; page++) {
    const res = await PracticesService.getPractices({ limit: pLimit, offset: pOffset });
    const data = (res as any)?.data ?? [];
    allPractices.push(...data);
    pOffset += pLimit;
    const total = (res as any)?.total as number | undefined;
    if (data.length < pLimit) break;
    if (total && allPractices.length >= total) break;
  }

  const totalPractices = allPractices.filter((p: any) => p?.lessonId && lessonIdSet.has(String(p.lessonId))).length;

  // Fetch public total users (if backend allows expose via includeUsers flag)
  let totalUsers: number | undefined = undefined;
  try {
    const res = await api.get('/api/v1/public/stats', { params: { includeUsers: '1' } });
    if (typeof res.data?.totalUsers === 'number') {
      totalUsers = res.data.totalUsers;
    }
  } catch {}

  return {
    totalLessons,
    totalViews,
    totalPractices,
    totalUsers,
  };
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ['public-stats'],
    queryFn: fetchPublicStats,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


