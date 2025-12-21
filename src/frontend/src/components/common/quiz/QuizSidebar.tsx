import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

type LessonMeta = {
    slug: string;
    title: string;
    description: string;
};

type Props = {
    items: LessonMeta[];
};

export default function QuizSidebar({ items }: Props) {
    const [query, setQuery] = React.useState<string>("");
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const t = useTranslations('common');

    const activeSlug = searchParams?.get('lesson') || null;

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }, [items, query]);

    const handleLessonClick = (slug: string) => {
        // This will be handled by the page component
    };

    return (
        <aside className="w-full md:w-64 lg:w-72 xl:w-80 flex-shrink-0 md:sticky md:top-6 self-start">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
                <h2 className="text-base md:text-lg font-semibold text-foreground">Danh sách bài học</h2>
                <label htmlFor="quiz-lesson-search" className="sr-only">Tìm kiếm bài học</label>
                <input
                    id="quiz-lesson-search"
                    type="search"
                    placeholder="Tìm kiếm bài học..."
                    className="mt-3 w-full px-3 py-2 rounded-md bg-background border border-[var(--border)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Tìm kiếm bài học"
                />
                <nav className="mt-3 max-h-[70vh] overflow-auto pr-1" aria-label="Danh sách bài học">
                    <div className="space-y-1">
                        {filtered.map((item) => {
                            const isActive = item.slug === activeSlug;
                            return (
                                <span key={item.slug}>
                                    <Link
                                        href={`/${locale}/quiz?lesson=${item.slug}`}
                                        className={`block text-left w-full px-2 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                                            isActive 
                                                ? "bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]" 
                                                : "hover:bg-muted text-foreground"
                                        }`}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <span className="font-medium">{item.title}</span>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                    </Link>
                                </span>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </aside>
    );
}


