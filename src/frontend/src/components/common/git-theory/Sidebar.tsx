import React, { useEffect, useState } from "react";
import { LessonMeta } from "@/types/git-theory";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSlugFromPath } from "@/lib/git-theory/get-slug-from-path";
import { useTranslations } from 'next-intl';

type Props = {
    items: LessonMeta[];
};

export default function Sidebar({ items }: Props) {
    const [query, setQuery] = React.useState<string>("");
    const pathname = usePathname();
    const t = useTranslations('gitTheory');

    const [activeSlug, setActiveSlug] = useState<string>(getSlugFromPath(pathname));

    useEffect(() => {
        setActiveSlug(getSlugFromPath(pathname));
    }, [pathname]);
    
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }, [items, query]);

    return (
        <aside className="w-full md:w-64 lg:w-72 xl:w-80 flex-shrink-0 md:sticky md:top-6 self-start">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4">
                <h2 className="text-base md:text-lg font-semibold text-foreground">{t('title')}</h2>
                <label htmlFor="git-theory-search" className="sr-only">{t('searchLabel')}</label>
                <input
                    id="git-theory-search"
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    className="mt-3 w-full px-3 py-2 rounded-md bg-background border border-[var(--border)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label={t('searchLabel')}
                />
                <nav className="mt-3 max-h-[70vh] overflow-auto pr-1" aria-label={t('tableOfContents')}>
                    <div className="space-y-1 list-decimal">
                        {filtered.map((item) => {
                            const isActive = item.slug === activeSlug;
                            return (
                                <span key={item.slug}>
                                    <Link
                                        href={`/git-theory/${item.slug}`}
                                        className={`block text-left w-full px-2 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${isActive ? "bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]" : "hover:bg-muted text-foreground"
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