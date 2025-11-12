'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, CheckCircle, Play, Info } from 'lucide-react';
import { Practice } from '@/services/practices';
import { getDifficultyColor } from '@/utils/practice';
import { useTranslations } from 'next-intl';

interface PracticeListProps {
  practices: Practice[];
  onSelectPractice?: (practice: Practice) => void;
  onStartPractice?: (practice: Practice) => void;
  selectedPracticeId?: string;
}

export default function PracticeList({ 
  practices, 
  onSelectPractice, 
  onStartPractice,
  selectedPracticeId 
}: PracticeListProps) {
  const t = useTranslations('practice');

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return t('beginner');
      case 2:
        return t('intermediate');
      case 3:
        return t('advanced');
      default:
        return t('details.difficultyUnknown');
    }
  };

  return (
    <div className="space-y-4">
      {practices.map((practice, index) => (
        <motion.div
          key={practice.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card 
            className={`transition-all duration-200 hover:shadow-md ${
              selectedPracticeId === practice.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {practice.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground">
                    {practice.scenario}
                  </CardDescription>
                </div>
                <Badge 
                  className={`ml-3 ${getDifficultyColor(practice.difficulty)}`}
                  variant="secondary"
                >
                  {getDifficultyLabel(practice.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{t('details.estimatedTimeLabel', { count: practice.estimatedTime })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{t('details.viewsCount', { count: practice.views })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('details.completionsCount', { count: practice.completions })}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPractice?.(practice);
                    }}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    {t('viewDetails')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartPractice?.(practice);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {t('startPractice')}
                  </Button>
                </div>
              </div>
              
              {practice.tags && practice.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {practice.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
