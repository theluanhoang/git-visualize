import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QuizzesService, GetQuizzesQuery } from '@/services/quizzes';
import { quizKeys } from '@/lib/react-query/query-keys';

export const useQuizzes = (query: GetQuizzesQuery = {}) => {
  return useQuery({
    queryKey: quizKeys.list(query),
    queryFn: () => QuizzesService.getQuizzes(query),
  });
};

export const useQuiz = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => QuizzesService.getQuizById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof QuizzesService.create>[0]) => 
      QuizzesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof QuizzesService.update>[1] }) =>
      QuizzesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.id) });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => QuizzesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
  });
};

export const useIncrementQuizViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => QuizzesService.incrementViews(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
    },
  });
};

export const useIncrementQuizCompletions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => QuizzesService.incrementCompletions(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
    },
  });
};
















