import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PracticesService, GetPracticesQuery } from '@/services/practices';
import { IRepositoryState } from '@/types/git';
import { practiceKeys } from '@/lib/react-query/query-keys';

export const usePractices = (query: GetPracticesQuery & { publishedOnly?: boolean; enabled?: boolean } = {}) => {
  const { enabled = true, ...queryParams } = query;
  return useQuery({
    queryKey: practiceKeys.list(queryParams),
    queryFn: () => PracticesService.getPractices(queryParams),
    enabled,
  });
};

export const usePracticesOfLesson = (lessonSlug: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: practiceKeys.lesson(lessonSlug || ''),
    queryFn: () => PracticesService.getPracticesOfLesson(lessonSlug!),
    enabled: !!lessonSlug && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useIncrementViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PracticesService.incrementViews(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceKeys.detail(id) });
    },
  });
};

export const useIncrementCompletions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PracticesService.incrementCompletions(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.all });
      queryClient.invalidateQueries({ queryKey: practiceKeys.detail(id) });
    },
  });
};

export const useValidatePractice = () => {
  return useMutation({
    mutationFn: ({ practiceId, userRepositoryState }: { practiceId: string; userRepositoryState: IRepositoryState }) =>
      PracticesService.validatePractice(practiceId, userRepositoryState),
  });
};
