import { useState, useCallback, useEffect } from 'react';

interface InitialGuidanceState {
  isOpen: boolean;
  practiceTitle?: string;
  firstCommand?: string;
  guidanceMessage?: string;
}

export const useInitialGuidance = () => {
  const [guidanceState, setGuidanceState] = useState<InitialGuidanceState>({
    isOpen: false
  });

  const showInitialGuidance = useCallback((config: {
    practiceTitle?: string;
    firstCommand?: string;
    guidanceMessage?: string;
  } = {}) => {
    setGuidanceState({
      isOpen: true,
      practiceTitle: config.practiceTitle,
      firstCommand: config.firstCommand,
      guidanceMessage: config.guidanceMessage
    });
  }, []);

  const hideInitialGuidance = useCallback(() => {
    setGuidanceState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const closeInitialGuidance = useCallback(() => {
    setGuidanceState({
      isOpen: false
    });
  }, []);

  // Auto show guidance when component mounts (for demo purposes)
  useEffect(() => {
    // You can add logic here to determine when to show initial guidance
    // For example, check if user is new to the practice or hasn't performed any actions
  }, []);

  return {
    guidanceState,
    showInitialGuidance,
    hideInitialGuidance,
    closeInitialGuidance
  };
};
