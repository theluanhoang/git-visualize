import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RatingsService, CreateRatingDto, RatingResponse, LessonRatingStats } from '@/services/ratings';
import { lessonKeys } from '@/lib/react-query/query-keys';

export const ratingKeys = {
  all: ['ratings'] as const,
  userRating: (lessonId: string) => [...ratingKeys.all, 'user', lessonId] as const,
  stats: (lessonId: string) => [...ratingKeys.all, 'stats', lessonId] as const,
  list: (lessonId: string) => [...ratingKeys.all, 'list', lessonId] as const,
};

export const useUserRating = (lessonId: string) => {
  return useQuery<RatingResponse | null>({
    queryKey: ratingKeys.userRating(lessonId),
    queryFn: () => RatingsService.getUserRating(lessonId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLessonRatingStats = (lessonId: string) => {
  return useQuery<LessonRatingStats>({
    queryKey: ratingKeys.stats(lessonId),
    queryFn: () => RatingsService.getLessonRatingStats(lessonId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLessonRatings = (lessonId: string) => {
  return useQuery<RatingResponse[]>({
    queryKey: ratingKeys.list(lessonId),
    queryFn: () => RatingsService.getLessonRatings(lessonId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, dto }: { lessonId: string; dto: CreateRatingDto }) =>
      RatingsService.createRating(lessonId, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.userRating(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.stats(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, dto }: { lessonId: string; dto: CreateRatingDto }) =>
      RatingsService.updateRating(lessonId, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.userRating(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.stats(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => RatingsService.deleteRating(lessonId),
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.userRating(lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.stats(lessonId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.list(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

