'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Practice } from '@/services/practices';

interface InstructionsCardProps {
  practice: Practice;
}

export default function InstructionsCard({ practice }: InstructionsCardProps) {
  if (!practice.instructions || practice.instructions.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Step-by-Step Instructions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Follow these steps in order to complete the practice successfully.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {practice.instructions.map((instruction, index) => (
            <motion.div
              key={instruction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
                {instruction.order}
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  {instruction.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>📋 Note:</strong> Complete each step before moving to the next one. You can refer to the expected commands section for the exact commands to use.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


