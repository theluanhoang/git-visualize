'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  useUserRating,
  useLessonRatingStats,
  useLessonRatings,
  useCreateRating,
  useUpdateRating,
  useDeleteRating,
} from '@/lib/react-query/hooks/use-ratings';
import { CreateRatingDto } from '@/services/ratings';
import { useRatingWebSocket } from '@/hooks/use-rating-websocket';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { RatingStats } from './RatingStats';
import { RatingForm } from './RatingForm';
import { CommentList } from './CommentList';

interface RatingDisplayProps {
  lessonId: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ lessonId }) => {
  const t = useTranslations('gitTheory.rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isEditingOwnRating, setIsEditingOwnRating] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ id: string; userId: string } | null>(null);

  const { data: userRating, isLoading: isLoadingUserRating } = useUserRating(lessonId);
  const { data: stats, isLoading: isLoadingStats } = useLessonRatingStats(lessonId);
  const { data: allRatings, isLoading: isLoadingRatings } = useLessonRatings(lessonId);
  const createRating = useCreateRating();
  const updateRating = useUpdateRating();
  const deleteRating = useDeleteRating();

  const currentUser = localStorageHelpers.getJSON<any>(LOCALSTORAGE_KEYS.AUTH.USER, null);
  const currentUserId = currentUser?.id;

  const commentsList = allRatings?.filter((rating) => rating.comment && rating.comment.trim()) || [];

  useRatingWebSocket({ lessonId, enabled: !!lessonId });

  const hasUserRating = !!userRating;

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (isSubmitting) return;

    if (!hasUserRating && rating === 0) {
      toast.warning(t('rateBeforeComment'));
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateRatingDto = {
        rating: rating || 5,
        comment: comment.trim(),
      };

      if (hasUserRating) {
        await updateRating.mutateAsync({ lessonId, dto });
      } else {
        await createRating.mutateAsync({ lessonId, dto });
      }
      toast.success(t('submitSuccess'));
    } catch (error) {
      toast.error(t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCommentSave = async (rating: number, comment: string) => {
    if (isSubmitting) return;

    if (rating === 0) {
      toast.warning(t('pleaseRate'));
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateRatingDto = {
        rating: rating || userRating?.rating || 5,
        comment: comment.trim() || undefined,
      };
      await updateRating.mutateAsync({ lessonId, dto });
      setEditingCommentId(null);
      setIsEditingOwnRating(false);
      toast.success(t('updateSuccess'));
    } catch (error) {
      toast.error(t('updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommentClick = (ratingId: string, userId: string) => {
    if (userId !== currentUserId) return;
    setCommentToDelete({ id: ratingId, userId });
    setShowDeleteCommentDialog(true);
  };

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteRating.mutateAsync(lessonId);
      setEditingCommentId(null);
      setShowDeleteCommentDialog(false);
      setCommentToDelete(null);
      toast.success(t('deleteCommentSuccess'));
    } catch (error) {
      toast.error(t('deleteCommentError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCommentStart = (ratingId: string) => {
    if (userRating?.id === ratingId) {
      setIsEditingOwnRating(true);
    } else {
      setEditingCommentId(ratingId);
    }
  };

  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setIsEditingOwnRating(false);
  };

  const handleDeleteRating = async () => {
    if (isSubmitting || !hasUserRating) return;

    setIsSubmitting(true);
    try {
      await deleteRating.mutateAsync(lessonId);
      setShowDeleteDialog(false);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isLoadingStats && isLoadingUserRating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Stats */}
        {stats && <RatingStats stats={stats} />}

        {/* User Rating Section */}
        {!hasUserRating || isEditingOwnRating ? (
          <div className="space-y-4 pt-4 border-t">
            {isEditingOwnRating ? (
              <RatingForm
                initialRating={userRating?.rating || 0}
                initialComment={userRating?.comment || ''}
                onSubmit={async (rating, comment) => {
                  await handleEditCommentSave(rating, comment);
                }}
                onCancel={() => {
                  setIsEditingOwnRating(false);
                }}
                isSubmitting={isSubmitting}
                submitLabel={t('saveChanges')}
                cancelLabel={t('cancel')}
                showCancel={true}
                requireRating={true}
              />
            ) : (
              <RatingForm
                onSubmit={handleSubmitRating}
                isSubmitting={isSubmitting}
                submitLabel={t('submitComment')}
                requireRating={!hasUserRating}
              />
            )}
          </div>
        ) : null}

        {/* Comments List Section */}
        <CommentList
          comments={commentsList}
          currentUserId={currentUserId}
          editingCommentId={editingCommentId}
          isSubmitting={isSubmitting}
          onEditStart={handleEditCommentStart}
          onEditCancel={handleEditCommentCancel}
          onEditSave={async (ratingId, rating, comment) => {
            await handleEditCommentSave(rating, comment);
          }}
          onDelete={handleDeleteCommentClick}
        />
      </CardContent>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t('deleteRating')}
        description={t('deleteRatingConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        loading={isSubmitting}
        onConfirm={handleDeleteRating}
        onClose={() => setShowDeleteDialog(false)}
      />

      <ConfirmDialog
        open={showDeleteCommentDialog}
        title={t('deleteComment')}
        description={t('deleteCommentConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        loading={isSubmitting}
        onConfirm={handleDeleteCommentConfirm}
        onClose={() => {
          setShowDeleteCommentDialog(false);
          setCommentToDelete(null);
        }}
      />
    </Card>
  );
};

export default RatingDisplay;

