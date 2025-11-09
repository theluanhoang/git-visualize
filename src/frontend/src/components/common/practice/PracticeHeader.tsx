'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface PracticeHeaderProps {
  lessonTitle?: string;
  lessonDescription?: string;
}

export default function PracticeHeader({ lessonTitle, lessonDescription }: PracticeHeaderProps) {
  const t = useTranslations('practice');
  const tCommon = useTranslations('common');
  return (
    <motion.section 
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 mb-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_60%_at_20%_0%,#000_20%,transparent_70%)]">
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT)/15%,transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary.700)/12%,transparent_60%)]" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lessonTitle ? `${t('title')}: ${lessonTitle}` : 'Git Practice Lab'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lessonDescription || 'Thực hành các lệnh Git bạn đã học với terminal và xem kết quả trên đồ thị commit.'}
          </p>
        </div>
        <Link 
          href="/git-theory" 
          className="px-4 py-2 rounded-md border border-[var(--border)] bg-background text-foreground text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          ← {tCommon('back')} {tCommon('gitTheory')}
        </Link>
      </div>
    </motion.section>
  );
}
