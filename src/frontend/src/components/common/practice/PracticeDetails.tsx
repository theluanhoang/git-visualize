'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, CheckCircle, Play, Lightbulb, List, Terminal, Shield } from 'lucide-react';
import { Practice } from '@/services/practices';
import { getDifficultyColor } from '@/utils/practice';
import { useTranslations } from 'next-intl';

interface PracticeDetailsProps {
  practice: Practice;
  onStartPractice?: () => void;
}

export default function PracticeDetails({ practice, onStartPractice }: PracticeDetailsProps) {
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

  const formatCount = (key: 'estimatedTimeLabel' | 'viewsCount' | 'completionsCount', count: number) =>
    t(`details.${key}`, { count });

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {practice.title}
              </CardTitle>
              {practice.scenario && (
                <CardDescription className="text-sm md:text-base text-muted-foreground">
                  {practice.scenario}
                </CardDescription>
              )}
            </div>
            <Badge 
              className={`shrink-0 ${getDifficultyColor(practice.difficulty)}`}
              variant="secondary"
            >
              {getDifficultyLabel(practice.difficulty)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatCount('estimatedTimeLabel', practice.estimatedTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Eye className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatCount('viewsCount', practice.views)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatCount('completionsCount', practice.completions)}</span>
            </div>
          </div>
          
          {/* Tags */}
          {practice.tags && practice.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {practice.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: tag.color || '#3B82F6', color: tag.color || '#3B82F6' }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Start Button */}
          <Button 
            size="lg" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onStartPractice) {
                onStartPractice();
              }
            }}
            className="w-full"
            disabled={!onStartPractice}
          >
            <Play className="w-4 h-4 mr-2" />
            {t('startPractice')}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      {practice.instructions && practice.instructions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <List className="w-4 h-4" />
              <span>{t('details.instructionsTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practice.instructions
                .sort((a, b) => a.order - b.order)
                .map((instruction, index) => (
                  <div key={instruction.id} className="flex items-start gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{instruction.content}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hints */}
      {practice.hints && practice.hints.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>{t('details.hintsTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practice.hints
                .sort((a, b) => a.order - b.order)
                .map((hint) => (
                  <div key={hint.id} className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{hint.content}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Commands */}
      {practice.expectedCommands && practice.expectedCommands.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>{t('details.expectedCommandsTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practice.expectedCommands
                .sort((a, b) => a.order - b.order)
                .map((command, index) => (
                  <div key={command.id} className="flex items-center gap-2">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200">
                      {index + 1}
                    </div>
                    <code className="flex-1 bg-muted px-3 py-1.5 rounded text-xs font-mono break-all">
                      {command.command}
                    </code>
                    {command.isRequired && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {t('details.required')}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Rules */}
      {practice.validationRules && practice.validationRules.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{t('details.validationRulesTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practice.validationRules
                .sort((a, b) => a.order - b.order)
                .map((rule) => (
                  <div key={rule.id} className="p-2.5 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-xs">
                        {rule.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground mb-1">{rule.message}</p>
                    {rule.value && (
                      <code className="text-xs text-muted-foreground font-mono block break-all">
                        {rule.value}
                      </code>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
