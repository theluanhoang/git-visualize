'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Practice } from '@/services/practices';
import { Badge } from '@/components/ui/badge';

interface SuccessCriteriaCardProps {
  practice: Practice;
}

export default function SuccessCriteriaCard({ practice }: SuccessCriteriaCardProps) {
  if (!practice.validationRules || practice.validationRules.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          Success Criteria
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These are the requirements you need to meet to complete the practice successfully.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {practice.validationRules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-xs font-semibold">
                {rule.order}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {rule.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    {rule.value}
                  </span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {rule.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


