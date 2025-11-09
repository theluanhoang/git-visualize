'use client';

import React from 'react';
import CelebrationModal from './CelebrationModal';
import { useCelebration } from '@/hooks/use-celebration';

interface CelebrationProviderProps {
  children: React.ReactNode;
}

export const CelebrationContext = React.createContext<ReturnType<typeof useCelebration> | null>(null);

export default function CelebrationProvider({ children }: CelebrationProviderProps) {
  const celebration = useCelebration();

  return (
    <CelebrationContext.Provider value={celebration}>
      {children}
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={celebration.closeCelebration}
        title={celebration.celebration?.title}
        message={celebration.celebration?.message}
        actionLabel={celebration.celebration?.actionLabel}
        onAction={celebration.celebration?.onAction}
        showFireworks={celebration.celebration?.showFireworks}
        showConfetti={celebration.celebration?.showConfetti}
        showSparkles={celebration.celebration?.showSparkles}
        playSound={celebration.celebration?.playSound}
        duration={celebration.celebration?.duration}
      />
    </CelebrationContext.Provider>
  );
}

export const useCelebrationContext = () => {
  const context = React.useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrationContext must be used within a CelebrationProvider');
  }
  return context;
};
