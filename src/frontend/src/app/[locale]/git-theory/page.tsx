'use client';

import React from 'react';
import Link from 'next/link';
import { useLessons, useMyLessons } from '@/lib/react-query/hooks/use-lessons';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { SearchParamsProvider } from '@/components/common';
import { EmptyLessonsState } from '@/components/common/git-theory/EmptyLessonsState';
import { useProAccess } from '@/hooks/use-pro-access';

export const dynamic = 'force-dynamic';

function GitTheoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') || '';
  const t = useTranslations('gitTheory.page');
  const tCommon = useTranslations('common');
  const { isPro } = useProAccess();
  const { data, isLoading, error } = useLessons({
    limit: 100,
    offset: 0,
    status: 'published'
  });
  const { data: myLessonsData } = useMyLessons({
    limit: 100,
    offset: 0,
    enabled: isPro
  });

  // Merge myLessons into main data, avoiding duplicates
  const mergedData = React.useMemo(() => {
    if (!data) return [];
    
    const publicLessons = data || [];
    const myLessons = myLessonsData?.data 
      ? myLessonsData.data
          .filter((l: any) => l.status === 'published')
          .map((l: any) => ({
            ...l,
            id: l.id,
            title: l.title,
            slug: l.slug,
            description: l.description,
            content: l.content,
            status: l.status,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
            views: l.views,
          }))
      : [];
    
    // Create a map of slugs to avoid duplicates
    const lessonMap = new Map<string, any>();
    
    // First add public lessons
    publicLessons.forEach((lesson: any) => {
      lessonMap.set(lesson.slug, lesson);
    });
    
    // Then add myLessons (will overwrite if same slug, which is correct - user's own lesson takes priority)
    myLessons.forEach((lesson: any) => {
      lessonMap.set(lesson.slug, lesson);
    });
    
    // Convert back to array and sort
    return Array.from(lessonMap.values()).sort((a: any, b: any) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
      return aTime - bTime; // oldest -> newest
    });
  }, [data, myLessonsData]);

  const filteredData = React.useMemo(() => {
    if (!mergedData || mergedData.length === 0) return [];
    if (!query.trim()) return mergedData;
    
    const searchTerm = query.toLowerCase().trim();
    return mergedData.filter((lesson: any) => {
      const title = (lesson.title || '').toLowerCase();
      const description = (lesson.description || '').toLowerCase();
      const slug = (lesson.slug || '').toLowerCase();
      return title.includes(searchTerm) || 
             description.includes(searchTerm) || 
             slug.includes(searchTerm);
    });
  }, [mergedData, query]);

  React.useEffect(() => {
    if (!query && mergedData && mergedData.length > 0) {
      const first = mergedData[0];
      if (first?.slug) {
        router.replace(`/${locale}/git-theory/${first.slug}`);
      }
    }
  }, [mergedData, router, query, locale]);

  if (!isLoading && !error && !query && (!mergedData || mergedData.length === 0)) {
    return <EmptyLessonsState />;
  }

  const clearSearch = () => {
    router.push(`/${locale}/git-theory`);
  };

  if (isLoading) return <div className="p-4">{t('loadingLessons')}</div>;
  if (error) return <div className="p-4 text-red-500">{t('failedToLoad')}</div>;

  return (
    <div className="container mx-auto p-4">
      {query && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md">
            <Search className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)]">
              {tCommon('search')}: <strong>"{query}"</strong>
            </span>
            <button
              onClick={clearSearch}
              className="ml-2 p-1 hover:bg-[var(--primary)]/20 rounded transition-colors"
              aria-label={tCommon('cancel')}
            >
              <X className="h-4 w-4 text-[var(--primary)]" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredData.length} {filteredData.length === 1 ? t('result') : t('results')}
          </span>
        </div>
      )}
      
      {!query && (
        <h1 className="text-2xl font-bold mb-4">{t('lessonsList')}</h1>
      )}

      {filteredData.length === 0 && query ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {t('noResultsFound', { query })}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {t('tryDifferentKeywords')}
          </p>
          <button
            onClick={clearSearch}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {tCommon('back')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((lesson: any) => (
            <Link 
              key={lesson.id ?? lesson.slug} 
              href={`/${locale}/git-theory/${lesson.slug}`} 
              className="block border rounded-md p-4 hover:bg-muted/40 transition-colors"
            >
              <h2 className="font-semibold text-lg">{lesson.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{lesson.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GitTheoryPage() {
  return (
    <SearchParamsProvider>
      <GitTheoryPageContent />
    </SearchParamsProvider>
  );
}