'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { Practice } from '@/services/practices';

interface HintsCardProps {
  practice: Practice;
}

export default function HintsCard({ practice }: HintsCardProps) {
  if (!practice.hints || practice.hints.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Additional Hints
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These hints will help you if you get stuck on any step.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {practice.hints.map((hint, index) => (
            <motion.div
              key={hint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center justify-center text-xs font-semibold">
                {hint.order}
              </div>
              <div className="flex items-start gap-2 flex-1">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {hint.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>💡 Pro Tip:</strong> Try to solve each step on your own first, then use these hints if you need help!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


