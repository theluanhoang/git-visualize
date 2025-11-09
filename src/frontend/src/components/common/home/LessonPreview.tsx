'use client';

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LessonPreview() {
  const lessons = [
    { title: 'Git Basics', completed: true },
    { title: 'Working with Branches', completed: true },
    { title: 'Merge Strategies', completed: false },
    { title: 'Advanced Git Workflows', completed: false },
  ];

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-[var(--background)] border border-[var(--border)] shadow-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
        <span className="text-sm font-semibold text-[var(--foreground)]">Git Lessons</span>
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
              lesson.completed
                ? 'bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 border-[var(--primary-200)] dark:border-[var(--primary-800)]'
                : 'bg-[var(--muted)]/30 border-[var(--border)]'
            }`}
          >
            <div className={`flex-shrink-0 ${
              lesson.completed ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-gray-400'
            }`}>
              {lesson.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                lesson.completed 
                  ? 'text-[var(--foreground)]' 
                  : 'text-[var(--muted-foreground)]'
              }`}>
                {lesson.title}
              </h4>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
          <span>Progress</span>
          <span>50%</span>
        </div>
        <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-400)]"
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

