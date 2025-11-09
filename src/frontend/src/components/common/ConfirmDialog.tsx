'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const defaultConfirmText = confirmText || t('confirm');
  const defaultCancelText = cancelText || t('cancel');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="px-5 py-4 flex items-center justify-end gap-3">
            <button
              className="px-3 py-2 rounded-md border border-[var(--border)] hover:bg-muted"
              onClick={onClose}
            >
              {defaultCancelText}
            </button>
            <button
              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? t('processing') : defaultConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
