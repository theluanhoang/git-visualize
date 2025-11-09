'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RatingResponse } from '@/services/ratings';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: RatingResponse[];
  currentUserId?: string;
  editingCommentId: string | null;
  isSubmitting?: boolean;
  onEditStart: (ratingId: string) => void;
  onEditCancel: () => void;
  onEditSave: (ratingId: string, rating: number, comment: string) => Promise<void>;
  onDelete: (ratingId: string, userId: string) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUserId,
  editingCommentId,
  isSubmitting = false,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDelete,
}) => {
  const t = useTranslations('gitTheory.rating');
  
  if (comments.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-semibold">{t('comments')} ({comments.length})</h3>
      <div className="space-y-3">
        {comments.map((rating) => {
          const isOwnComment = rating.userId === currentUserId;
          const isEditing = editingCommentId === rating.id;

          return (
            <div
              key={rating.id}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <CommentItem
                rating={rating}
                isOwnComment={isOwnComment}
                isEditing={isEditing}
                isSubmitting={isSubmitting}
                onEdit={onEditStart}
                onDelete={onDelete}
                onSave={onEditSave}
                onCancel={onEditCancel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

