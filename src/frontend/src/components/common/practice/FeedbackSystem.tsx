'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/types/feedback';
import { useCelebrationContext } from '@/components/common/animations';
import ErrorFeedbackModal from '@/components/common/animations/ErrorFeedbackModal';
import { useErrorFeedback } from '@/hooks/use-error-feedback';

interface FeedbackSystemProps {
  feedback: Feedback | null;
  onClose: () => void;
}

export default function FeedbackSystem({ feedback, onClose }: FeedbackSystemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const celebration = useCelebrationContext();
  const { errorFeedback, showErrorFeedback, closeErrorFeedback } = useErrorFeedback();

  // Parse validation differences from message
  const parseValidationDifferences = (message: string) => {
    const differences: Array<{type: string, field: string, expected: string | number, actual: string | number}> = [];
    
    // Look for patterns like "- [commit] count: expected 2, got 1"
    const lines = message.split('\n');
    lines.forEach(line => {
      const match = line.match(/- \[(\w+)\] (\w+): expected (.+), got (.+)/);
      if (match) {
        differences.push({
          type: match[1],
          field: match[2],
          expected: match[3],
          actual: match[4]
        });
      }
    });
    
    return differences;
  };

  useEffect(() => {
    if (feedback) {
      setIsVisible(true);
      
      if (feedback.type === 'congratulations' && feedback.isEpic) {
        celebration.triggerEpicCelebration(
          feedback.title,
          feedback.message,
          feedback.action ? {
            label: feedback.action.label,
            onClick: feedback.action.onClick
          } : undefined
        );
        return;
      }

      // Check if this is a validation error that should show error feedback modal
      if (feedback.type === 'success' && feedback.message.includes('differences')) {
        const differences = parseValidationDifferences(feedback.message);
        if (differences.length > 0) {
          showErrorFeedback(differences);
          return;
        }
      }
      
      if (feedback.autoHide !== false) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, feedback.duration || 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [feedback, onClose, celebration]);

  const getIcon = () => {
    switch (feedback?.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'hint':
        return <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'congratulations':
        return <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (feedback?.type) {
      case 'success':
        return 'bg-[var(--surface)] border-[var(--border)] dark:bg-green-950/40 dark:border-green-700/40';
      case 'error':
        return 'bg-[var(--surface)] border-[var(--border)] dark:bg-red-950/40 dark:border-red-700/40';
      case 'warning':
        return 'bg-[var(--surface)] border-[var(--border)] dark:bg-yellow-950/30 dark:border-yellow-700/40';
      case 'hint':
        return 'bg-[var(--surface)] border-[var(--border)] dark:bg-blue-950/40 dark:border-blue-700/40';
      case 'congratulations':
        return 'bg-[var(--surface)] border-[var(--border)] dark:bg-amber-950/30 dark:border-amber-700/40';
      default:
        return 'bg-[var(--surface)] border-[var(--border)]';
    }
  };

  if (!feedback) return null;

  return (
    <>
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/70 transition-none" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-md"
          >
            <Card className={`${getBackgroundColor()} shadow-xl rounded-lg border backdrop-blur-sm text-foreground`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {getIcon()}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{feedback.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{feedback.message}</p>
                    {feedback.action && (
                      <Button
                        onClick={feedback.action.onClick}
                        size="sm"
                        className="w-full"
                      >
                        {feedback.action.label}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0 text-foreground/70 hover:text-foreground"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    {/* Error Feedback Modal */}
    <ErrorFeedbackModal
      isOpen={errorFeedback.isOpen}
      onClose={closeErrorFeedback}
      errorCount={errorFeedback.errorCount}
      errors={errorFeedback.errors}
      onRetry={() => {
        closeErrorFeedback();
        // Add retry logic here if needed
      }}
      onViewHint={() => {
        closeErrorFeedback();
        // Add hint logic here if needed
      }}
    />
    </>
  );
}