'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { Practice } from '@/services/practices';
import { toast } from 'sonner';

interface ExpectedCommandsCardProps {
  practice: Practice;
}

export default function ExpectedCommandsCard({ practice }: ExpectedCommandsCardProps) {
  if (!practice.expectedCommands || practice.expectedCommands.length === 0) return null;
  const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Expected Commands
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These are the commands you should execute to complete the practice successfully.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {practice.expectedCommands
            .map((cmd, index) => ({ ...cmd, originalIndex: index }))
            .sort((a, b) => {
              const orderA = typeof a.order === 'number' ? a.order : parseInt(String(a.order || 0));
              const orderB = typeof b.order === 'number' ? b.order : parseInt(String(b.order || 0));
              if (orderA === orderB) return a.originalIndex - b.originalIndex;
              return orderA - orderB;
            })
            .map((cmd, index) => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-sm font-semibold">
                {cmd.order}
              </div>
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono border break-words">
                {cmd.command}
              </code>
              <button
                type="button"
                onClick={async () => {
                  const t = toast.loading('Đang sao chép…', { position: 'top-right' });
                  try {
                    await navigator.clipboard.writeText(cmd.command);
                    toast.success('Đã sao chép lệnh', { id: t, position: 'top-right' });
                    setCopiedCommandId(cmd.id);
                    setTimeout(() => setCopiedCommandId(null), 1500);
                  } catch (e) {
                    toast.error('Sao chép thất bại', { id: t, position: 'top-right' });
                  }
                }}
                className="inline-flex items-center justify-center rounded border border-[var(--border)] bg-background hover:bg-muted p-1 text-muted-foreground"
                title="Copy command"
                aria-label={copiedCommandId === cmd.id ? `Copied command ${cmd.order}` : `Copy command ${cmd.order}`}
              >
                {copiedCommandId === cmd.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> You can copy these commands and paste them into the terminal. Make sure to execute them in the correct order!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


