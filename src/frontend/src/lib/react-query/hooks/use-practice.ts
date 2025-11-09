import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PracticesService from '@/services/practice';
import { PracticeFormData } from '@/lib/schemas/practice';
import { lessonKeys, practiceKeys, terminalKeys } from '../query-keys';

export const usePractices = (params?: {
  limit?: number;
  offset?: number;
  id?: string;
  lessonId?: string;
  lessonSlug?: string;
  difficulty?: number;
  tag?: string;
  q?: string;
  includeRelations?: boolean;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: practiceKeys.list(params),
    queryFn: () => PracticesService.getAll(params),
  });
};

export const usePractice = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: practiceKeys.detail(id),
    queryFn: () => PracticesService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreatePractice = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PracticeFormData & { lessonId: string }) => PracticesService.create(data),
    onSuccess: (newPractice) => {
      qc.invalidateQueries({ queryKey: practiceKeys.all });
      qc.setQueryData(practiceKeys.detail(newPractice.id), newPractice);
    },
    onError: (error: unknown) => {
      console.error('Create practice failed:', error);
    }
  });
};

export const useUpdatePractice = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PracticeFormData> }) => 
      PracticesService.update(id, data),
    onSuccess: (updatedPractice, variables) => {
      qc.setQueryData(practiceKeys.detail(updatedPractice.id), updatedPractice);
      
      qc.invalidateQueries({ queryKey: practiceKeys.all });
      
      if (updatedPractice.goalRepositoryState && variables.data.goalRepositoryState) {
        const mockResponses = [
          {
            repositoryState: updatedPractice.goalRepositoryState,
            command: 'git status',
            success: true,
            output: 'Repository state loaded for goal visualization'
          }
        ];
        qc.setQueryData(terminalKeys.goal, mockResponses);
      }
      
      qc.invalidateQueries({ queryKey: practiceKeys.detail(updatedPractice.id) });
    },
    onError: (error: unknown) => {
      console.error('Update practice failed:', error);
    }
  });
};

export const useDeletePractice = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PracticesService.delete(id),
    onSuccess: (_, deletedId) => {
      qc.removeQueries({ queryKey: practiceKeys.detail(deletedId) });
      qc.invalidateQueries({ queryKey: practiceKeys.all });
    },
    onError: (error: unknown) => {
      console.error('Delete practice failed:', error);
    }
  });
};

export const useIncrementViews = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PracticesService.incrementViews(id),
    onSuccess: (_, practiceId) => {
      qc.invalidateQueries({ queryKey: practiceKeys.detail(practiceId) });
    },
    onError: (error: unknown) => {
      console.error('Increment views failed:', error);
    }
  });
};

export const useIncrementCompletions = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PracticesService.incrementCompletions(id),
    onSuccess: (_, practiceId) => {
      qc.invalidateQueries({ queryKey: practiceKeys.detail(practiceId) });
    },
    onError: (error: unknown) => {
      console.error('Increment completions failed:', error);
    }
  });
};

export const useSavePractice = () => {
  const queryClient = useQueryClient();
  const createMutation = useCreatePractice();
  const updateMutation = useUpdatePractice();

  return useMutation({
    mutationFn: async ({ 
      formData, 
      lessonId, 
      practiceId 
    }: { 
      formData: PracticeFormData; 
      lessonId: string; 
      practiceId?: string; 
    }) => {
      if (practiceId) {
        return updateMutation.mutateAsync({ id: practiceId, data: formData });
      } else {
        return createMutation.mutateAsync({ ...formData, lessonId });
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      
      if (variables.practiceId) {
        queryClient.invalidateQueries({ queryKey: practiceKeys.detail(variables.practiceId) });
      }
    },
    onError: (error) => {
      console.error('Failed to save practice:', error);
    },
  });
};

export const usePracticeFormSubmission = () => {
  const saveMutation = useSavePractice();

  const handleSave = async (
    formData: PracticeFormData,
    lessonId: string,
    practiceId?: string
  ) => {
    try {
      const result = await saveMutation.mutateAsync({
        formData,
        lessonId,
        practiceId,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    handleSave,
    isSaving: saveMutation.isPending,
    error: saveMutation.error,
    isSuccess: saveMutation.isSuccess,
  };
};
