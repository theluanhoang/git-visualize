import { useState, useCallback } from 'react';

interface CelebrationConfig {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showFireworks?: boolean;
  showConfetti?: boolean;
  showSparkles?: boolean;
  playSound?: boolean;
  duration?: number;
}

export const useCelebration = () => {
  const [celebration, setCelebration] = useState<CelebrationConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const triggerCelebration = useCallback((config: CelebrationConfig) => {
    setCelebration(config);
    setIsOpen(true);
  }, []);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setCelebration(null);
    }, 500);
  }, []);

  const triggerSuccessCelebration = useCallback((
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    triggerCelebration({
      title,
      message,
      actionLabel: action?.label,
      onAction: action?.onClick,
      showFireworks: true,
      showConfetti: true,
      showSparkles: true,
      playSound: true,
      duration: 5000
    });
  }, [triggerCelebration]);

  const triggerQuickCelebration = useCallback((
    title: string,
    message?: string
  ) => {
    triggerCelebration({
      title,
      message,
      showFireworks: false,
      showConfetti: true,
      showSparkles: true,
      playSound: true,
      duration: 2000
    });
  }, [triggerCelebration]);

  const triggerEpicCelebration = useCallback((
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    triggerCelebration({
      title,
      message,
      actionLabel: action?.label,
      onAction: action?.onClick,
      showFireworks: true,
      showConfetti: true,
      showSparkles: true,
      playSound: true,
      duration: 8000
    });
  }, [triggerCelebration]);

  return {
    celebration,
    isOpen,
    triggerCelebration,
    closeCelebration,
    triggerSuccessCelebration,
    triggerQuickCelebration,
    triggerEpicCelebration
  };
};
