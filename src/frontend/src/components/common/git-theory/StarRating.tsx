'use client';

import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
  onHover?: (rating: number | null) => void;
  hoveredRating?: number | null;
  className?: string;
  starSize?: 'sm' | 'md' | 'lg';
}

const starSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  disabled = false,
  onRatingChange,
  onHover,
  hoveredRating = null,
  className,
  starSize = 'md',
}) => {
  const displayRating = hoveredRating ?? rating;
  const sizeClass = starSizes[starSize];

  const handleStarClick = (starValue: number) => {
    if (interactive && !disabled && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || disabled || !onHover) return;
    const target = e.target as HTMLElement;
    let button = target.closest('button[data-star-value]') as HTMLButtonElement;
    if (!button && target.hasAttribute('data-star-value')) {
      button = target as HTMLButtonElement;
    }
    if (button) {
      const starValue = parseInt(button.getAttribute('data-star-value') || '0');
      if (starValue > 0) {
        onHover(starValue);
      }
    }
  };

  const handleMouseLeave = () => {
    if (interactive && onHover) {
      onHover(null);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        const isHalfFilled = star - 0.5 === displayRating;

        return (
          <Button
            key={star}
            type="button"
            data-star-value={star}
            variant="ghost"
            size="icon-sm"
            disabled={!interactive || disabled}
            onClick={() => handleStarClick(star)}
            className={cn(
              'transition-all duration-150 p-0 h-auto w-auto !opacity-100',
              interactive && !disabled && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isHalfFilled ? (
              <StarHalf className={cn(sizeClass, 'fill-yellow-400 text-yellow-400')} />
            ) : (
              <Star
                className={cn(
                  sizeClass,
                  'transition-colors duration-150 text-yellow-400',
                  isFilled ? 'fill-yellow-400' : 'fill-none'
                )}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
};

