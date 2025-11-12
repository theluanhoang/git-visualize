'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Home, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export function EmptyLessonsState() {
  const t = useTranslations('gitTheory.page');
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-2xl mx-auto border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 md:py-20 px-6 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="relative flex items-center justify-center">
              <BookOpen className="h-24 w-24 md:h-28 md:w-28 text-muted-foreground/60" strokeWidth={1.5} />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('noLessonsAvailable')}
          </h2>
          
          <p className="text-muted-foreground mb-10 max-w-lg text-base md:text-lg leading-relaxed">
            {t('noLessonsDescription')}
          </p>

          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full sm:w-auto min-w-[160px]"
          >
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4 mr-2" />
              {t('goToHome')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

