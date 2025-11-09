'use client';

import { motion } from "framer-motion";
import { Users, BookOpen, GitBranch, Code } from 'lucide-react';
import { usePublicStats } from '@/lib/react-query/hooks/use-public-stats';
import { useTranslations } from 'next-intl';

export default function StatsSectionV3() {
  const t = useTranslations('home.stats');
  const { data, isLoading } = usePublicStats();

  const formatNumber = (num: number | undefined) => {
    if (num == null) return '0';
    const n = Number(num);
    if (!isFinite(n)) return '0';

    const units = [
      { value: 1_000_000_000_000, symbol: 'T' },
      { value: 1_000_000_000, symbol: 'B' },
      { value: 1_000_000, symbol: 'M' },
      { value: 1_000, symbol: 'K' },
    ];

    for (const u of units) {
      if (n >= u.value) {
        const base = n / u.value;
        if (base >= 10) return `${Math.floor(base)}${u.symbol}+`;
        const rounded = Math.round(base * 10) / 10;
        return `${rounded}${u.symbol}`;
      }
    }

    return Intl.NumberFormat().format(n);
  };

  const stats = [
    { icon: Code, label: t('practices'), value: formatNumber(data?.totalPractices), color: 'text-purple-600 dark:text-purple-400' },
    { icon: BookOpen, label: t('lessons'), value: formatNumber(data?.totalLessons), color: 'text-green-600 dark:text-green-400' },
    { icon: GitBranch, label: t('totalViews'), value: formatNumber(data?.totalViews), color: 'text-orange-600 dark:text-orange-400' },
    { icon: Users, label: t('activeLearners'), value: data?.totalUsers != null ? formatNumber(data?.totalUsers) : '—', color: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2">
                  {isLoading ? '—' : stat.value}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

