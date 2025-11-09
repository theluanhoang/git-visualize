'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomCTAV3() {
  const t = useTranslations('home.cta');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Ultra-subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--muted)]/20 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('title')}
          </motion.h2>
          
          <motion.p 
            className="text-lg text-[var(--muted-foreground)] mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
              className="px-6 py-3 text-sm h-auto rounded-md font-medium border-[var(--border)] hover:bg-[var(--muted)]/40 text-[var(--foreground)]"
            >
              <Link href={`/${locale}/practice`}>
                {t('practiceNow')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

