'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface VersionResetDialogProps {
  open: boolean;
  practiceTitle: string;
  currentVersion: number;
  savedVersion: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function VersionResetDialog({
  open,
  practiceTitle,
  currentVersion,
  savedVersion,
  onConfirm,
  loading = false,
}: VersionResetDialogProps) {
  const t = useTranslations('common');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('practiceUpdated')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('practiceUpdatedMessage', { practiceTitle, currentVersion })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="px-5 py-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    {t('savedProgressFrom', { savedVersion })}
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    {t('resetRequired')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>{t('thisWillClear')}</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t('terminalCommandHistory')}</li>
                <li>{t('commitGraphPositions')}</li>
                <li>{t('repositoryState')}</li>
              </ul>
            </div>
          </div>
          
          <div className="px-5 py-4 flex items-center justify-center border-t border-[var(--border)]">
            <button
              className="px-6 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('resetting')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t('resetAndContinue')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}