'use client';

import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import { useTranslations } from 'next-intl';

type Props = {
    onPrev?: () => void;
    onNext?: () => void;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
};

export default function LessonNavigation({ onPrev, onNext, prevDisabled, nextDisabled }: Props) {
    const t = useTranslations('gitTheory.lesson');
    
    return (
        <nav className="flex items-center justify-between mt-6" aria-label="Lesson navigation">
            <div>
                <button
                    onClick={onPrev}
                    disabled={prevDisabled}
                    className="px-4 py-2 cursor-pointer flex gap-2 items-center rounded-md border border-gray-300 bg-white text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    aria-disabled={prevDisabled}
                    aria-label={t('previousLesson')}
                >
                    <ArrowLeft size={14} />
                    {t('previousLesson')}
                </button>
            </div>
            <div>
                <button
                    onClick={onNext}
                    disabled={nextDisabled}
                    className="px-4 py-2 cursor-pointer flex gap-2 items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    aria-disabled={nextDisabled}
                    aria-label={t('nextLesson')}
                >
                    {t('nextLesson')}
                    <ArrowRight size={14} />
                </button>
            </div>
        </nav>
    );
} 