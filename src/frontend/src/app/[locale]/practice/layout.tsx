'use client';

import Link from 'next/link';
import { useLessons, useMyLessons } from '@/lib/react-query/hooks/use-lessons';
import React, { ReactNode } from 'react'
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import PracticeLessonsSidebar from '@/components/common/practice/PracticeLessonsSidebar';
import { useProAccess } from '@/hooks/use-pro-access';

export const dynamic = 'force-dynamic';

type Props = {
    children: ReactNode;
};

function PracticeLayout({ children }: Props) {
    const { data: lessonsData, isLoading } = useLessons({
        limit: 100,
        offset: 0,
        status: 'published'
    });
    const { isPro } = useProAccess();
    const { data: myLessonsData } = useMyLessons({
        limit: 100,
        offset: 0,
        enabled: isPro
    });
    const params = useParams();
    const pathname = usePathname();
    const locale = (params.locale as string) || 'en';
    const tCommon = useTranslations('common');

    // Kiểm tra xem có phải trang session không
    const isSessionPage = pathname?.includes('/practice/session');

    const data = lessonsData ? lessonsData
        .sort((a: any, b: any) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
            return aTime - bTime; // oldest -> newest
        })
        .map((l: any) => ({ slug: l.slug, title: l.title, description: l.description ?? '' })) : [];
    
    const myLessons = myLessonsData?.data 
        ? myLessonsData.data
            .filter((l: any) => l.status === 'published')
            .sort((a: any, b: any) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
                return aTime - bTime;
            })
            .map((l: any) => ({ slug: l.slug, title: l.title, description: l.description ?? '' }))
        : [];
    
    const hasLessons = !isLoading && data.length > 0 && !isSessionPage;

    return (
        <main className='container mx-auto mt-8 md:mt-10'>
            {!isSessionPage && (
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 md:p-6">
                    <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_20%_0%,#000_20%,transparent_70%)]">
                        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT)/15%,transparent_60%)]" />
                        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.700)/10%,transparent_60%)]" />
                    </div>

                    <nav aria-label="Breadcrumb" className="relative text-xs md:text-sm text-muted-foreground">
                        <ol className="flex items-center gap-2">
                            <li><Link href={`/${locale}`} className="hover:underline">{tCommon('home')}</Link></li>
                            <li aria-hidden>›</li>
                            <li className="text-foreground font-medium">{tCommon('practice')}</li>
                        </ol>
                    </nav>
                    <div className="relative mt-2 flex items-start gap-3">
                        <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20">
                            <span className="text-[var(--primary)] text-lg">⚡</span>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Git Practice Lab</h1>
                            <p className="text-muted-foreground text-sm md:text-[0.95rem] leading-relaxed">Thực hành các lệnh Git bạn đã học với terminal và xem kết quả trên đồ thị commit</p>
                        </div>
                    </div>
                </div>
            )}
            <div className={`${!isSessionPage ? 'mt-6 md:mt-8' : ''} flex flex-col gap-6 ${hasLessons ? 'md:flex-row md:gap-8' : ''}`}>
                {hasLessons && <PracticeLessonsSidebar items={data ?? []} myLessons={myLessons} />}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default PracticeLayout

