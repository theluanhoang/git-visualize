'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StarRating } from './StarRating';
import { LessonRatingStats } from '@/services/ratings';

interface RatingStatsProps {
  stats: LessonRatingStats;
}

export const RatingStats: React.FC<RatingStatsProps> = ({ stats }) => {
  const t = useTranslations('gitTheory.rating');
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(stats.averageRating)} starSize="md" />
          <span className="text-2xl font-semibold ml-2">
            {stats.averageRating.toFixed(1)}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          ({stats.totalRatings} {stats.totalRatings === 1 ? t('rating') : t('ratings')})
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.totalRatings > 0 && (
        <div className="space-y-2 pt-2 border-t">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-16">
                  <span>{star}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

