import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PracticesService, GetPracticesQuery } from '@/services/practices';
import { IRepositoryState } from '@/types/git';
import { practiceKeys } from '@/lib/react-query/query-keys';

export const usePractices = (query: GetPracticesQuery = {}) => {
  return useQuery({
    queryKey: practiceKeys.list(query),
    queryFn: () => PracticesService.getPractices(query),
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
