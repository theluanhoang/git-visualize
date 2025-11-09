'use client';

import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  slug: string;
  title?: string;
  description?: string;
};

export default function PracticeCTA({ slug, title, description }: Props) {
  const t = useTranslations('gitTheory.practiceCTA');
  return (
    <div className="rounded-lg p-6 border bg-[var(--surface)] border-[var(--border)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_60%_at_20%_0%,#000_20%,transparent_70%)]">
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT)/15%,transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.700)/12%,transparent_60%)]" />
      </div>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">🚀</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title || t('title')}</h3>
          <p className="text-muted-foreground mb-4">{description || t('description')}</p>
          <Link
            href={`/practice?lesson=${slug}`}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] shadow-sm ring-1 ring-[var(--primary-300)]/30"
          >
            {t('button')}
          </Link>
        </div>
      </div>
    </div>
  );
}
