'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { StarRating } from './StarRating';

interface RatingFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  requireRating?: boolean;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  showCancel = false,
  requireRating = false,
}) => {
  const t = useTranslations('gitTheory.rating');
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState(initialComment);
  
  const defaultSubmitLabel = t('submitComment');
  const defaultCancelLabel = t('cancel');

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (requireRating && selectedRating === 0) {
      return;
    }
    await onSubmit(selectedRating || initialRating || 5, comment);
    if (!initialComment) {
      setComment('');
      setSelectedRating(0);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setComment(initialComment);
    setSelectedRating(initialRating);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">
          {initialRating > 0 ? t('editRating') : t('rateThisLesson')}
        </Label>
        <div className="space-y-1">
          <StarRating
            rating={selectedRating || initialRating}
            interactive
            disabled={isSubmitting}
            onRatingChange={setSelectedRating}
            onHover={setHoveredRating}
            hoveredRating={hoveredRating}
          />
          {hoveredRating && hoveredRating !== initialRating && (
            <p className="text-xs text-muted-foreground animate-in fade-in duration-200">
              {t('clickStarToRate', { 
                rating: hoveredRating, 
                stars: hoveredRating === 1 ? t('star') : t('stars') 
              })}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="rating-comment" className="text-sm font-medium mb-2 block">
          {t('commentOptional')}
        </Label>
        <Textarea
          id="rating-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('commentPlaceholder')}
          className="min-h-[100px]"
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {t('charactersCount', { count: comment.length })}
          </span>
          <div className="flex items-center gap-2">
            {showCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {cancelLabel || defaultCancelLabel}
              </Button>
            )}
            {comment.trim() !== '' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSubmit}
                disabled={isSubmitting || (requireRating && selectedRating === 0 && initialRating === 0)}
              >
                {submitLabel || defaultSubmitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

