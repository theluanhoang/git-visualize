'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { RatingResponse } from '@/services/ratings';

interface CommentItemProps {
  rating: RatingResponse;
  isOwnComment: boolean;
  isEditing: boolean;
  isSubmitting?: boolean;
  onEdit: (ratingId: string) => void;
  onDelete: (ratingId: string, userId: string) => void;
  onSave: (ratingId: string, rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  rating,
  isOwnComment,
  isEditing,
  isSubmitting = false,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) => {
  const t = useTranslations('gitTheory.rating');
  const [editingRating, setEditingRating] = useState(rating.rating);
  const [editingComment, setEditingComment] = useState(rating.comment || '');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing) {
      setEditingRating(rating.rating);
      setEditingComment(rating.comment || '');
    }
  }, [isEditing, rating.rating, rating.comment]);

  const handleSave = async () => {
    if (editingRating === 0) return;
    await onSave(rating.id, editingRating, editingComment);
  };

  const handleCancel = () => {
    setEditingRating(rating.rating);
    setEditingComment(rating.comment || '');
    setHoveredRating(null);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('starRating')}
          </Label>
          <StarRating
            rating={editingRating}
            interactive
            disabled={isSubmitting}
            onRatingChange={setEditingRating}
            onHover={setHoveredRating}
            hoveredRating={hoveredRating}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('comment')}
          </Label>
          <Textarea
            value={editingComment}
            onChange={(e) => setEditingComment(e.target.value)}
            className="min-h-[80px]"
            maxLength={1000}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || editingRating === 0}
          >
            {t('saveChanges')}
          </Button>
        </div>
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (!rating.user) {
      return t('user');
    }
    
    if (rating.user.firstName || rating.user.lastName) {
      const name = `${rating.user.firstName || ''} ${rating.user.lastName || ''}`.trim();
      if (name) return name;
    }
    
    if (rating.user.email) {
      const emailPrefix = rating.user.email.split('@')[0];
      if (emailPrefix) return emailPrefix;
    }
    
    return t('user');
  };

  const getInitials = () => {
    if (!rating.user) return 'U';
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {rating.user?.avatar ? (
              <img
                src={rating.user.avatar}
                alt={getUserDisplayName()}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {getInitials()}
              </div>
            )}
          </div>
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">
                {getUserDisplayName()}
              </span>
              {rating.user?.email && (
                <span className="text-xs text-muted-foreground">
                  {rating.user.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {rating.comment}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <StarRating rating={rating.rating} starSize="sm" />
          <span>
            {new Date(rating.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
      {isOwnComment && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(rating.id)}
            title={t('edit')}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(rating.id, rating.userId)}
            disabled={isSubmitting}
            title={t('delete')}
            className="hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
};

