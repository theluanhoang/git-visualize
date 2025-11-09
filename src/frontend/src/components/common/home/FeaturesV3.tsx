'use client';

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, GitBranch, Terminal, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TerminalPreview from './TerminalPreview';
import CommitGraphPreview from './CommitGraphPreview';
import LessonPreview from './LessonPreview';

export default function FeaturesV3() {
  const t = useTranslations('home.features');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  const features = [
    { 
      icon: GitBranch, 
      title: t('clearPath.title'), 
      desc: t('clearPath.description'),
      href: `/${locale}/git-theory`
    },
    { 
      icon: Terminal, 
      title: t('fastLearning.title'), 
      desc: t('fastLearning.description'),
      href: `/${locale}/practice`
    },
    { 
      icon: BookOpen, 
      title: t('free.title'), 
      desc: t('free.description'),
      href: `/${locale}/git-theory`
    }
  ];
  
  return (
    <section className="py-24 sm:py-32 border-b border-[var(--border)] relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.primary.500)/12%,transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.emerald.500)/10%,transparent_60%)] blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--background),transparent_0%)] text-xs text-[var(--muted-foreground)] mb-4">
            ✨ {t('subtitle')}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-3">
            {t('title')}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Alternating split features inspired by GitHub */}
        <div className="space-y-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={feature.title}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Text */}
                  <div className={`order-2 md:order-${isEven ? '1' : '2'} md:col-span-5 p-6 lg:p-10 flex flex-col justify-center`}>
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed mb-5">
                      {feature.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {index === 0 && (
                        <>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.visualCommits')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.branchFlows')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.realTime')}</span>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.liveTerminal')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.instantFeedback')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.noSetup')}</span>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.curatedContent')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.stepByStep')}</span>
                          <span className="px-2.5 py-1 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">{t('chips.handsOn')}</span>
                        </>
                      )}
                    </div>
                    <Link href={feature.href} className="inline-flex items-center text-sm font-medium text-[var(--primary-600)] dark:text-[var(--primary-400)]">
                      {t('ctaLabel')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                  {/* Media */}
                  <div className={`order-1 md:order-${isEven ? '2' : '1'} md:col-span-7 relative bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-900)]/30 dark:to-[var(--primary-800)]/30`}> 
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    />
                    <div className="relative h-[280px] lg:h-[360px] overflow-hidden">
                      {index === 0 && (
                        <div className="absolute inset-0 p-3">
                          <CommitGraphPreview commits={[]} repositoryState={null} />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="absolute inset-0 p-3">
                          <TerminalPreview lines={[]} isTyping={false} />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="absolute inset-0 p-3">
                          <LessonPreview />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

