'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TerminalPreview from './TerminalPreview';
import CommitGraphPreview from './CommitGraphPreview';
import { useGitDemo } from './useGitDemo';

export default function HeroV3() {
  const t = useTranslations('home.hero');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { terminalLines, commits, activeBranch, repositoryState } = useGitDemo();

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      {/* Ultra-subtle background - Vercel style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Very subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.2]" 
          style={{
            backgroundImage: `linear-gradient(to right, var(--hero-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--hero-grid-line) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 70%, transparent 100%)'
          }}
        />
        
        {/* Very subtle gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[var(--primary-500)]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="text-center py-16 sm:py-20 lg:py-24">
            {/* Main Heading - i18n */}
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="block bg-gradient-to-r from-[var(--foreground)] via-[var(--primary-600)] to-[var(--foreground)] bg-clip-text text-transparent">
                {t('title')}
              </span>
            </motion.h1>

            {/* Subtitle - i18n */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('subtitle')}
            </motion.p>

            {/* CTA Buttons - Vercel style: clean, minimal */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                asChild
                size="sm"
                className="px-6 py-3 text-sm h-auto bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 rounded-md font-medium transition-colors shadow-none hover:shadow-sm"
              >
                <Link href={`/${locale}/git-theory`}>
                  {t('startLearning')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="px-6 py-3 text-sm h-auto rounded-md font-medium border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/40"
              >
                <Link href={`/${locale}/practice`}>
                  {t('explorePath')}
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Visual Demo Preview - Vercel style showcase */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Terminal Preview */}
            <div className="h-[400px]">
              <TerminalPreview lines={terminalLines} isTyping={terminalLines.length < 16} />
            </div>
            
            {/* Commit Graph Preview */}
            <div className="h-[400px]">
              <CommitGraphPreview commits={commits} repositoryState={repositoryState} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

