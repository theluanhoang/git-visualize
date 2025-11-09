import { useState, useCallback } from 'react';

interface ErrorItem {
  type: string;
  field: string;
  expected: string | number;
  actual: string | number;
}

interface ErrorFeedbackState {
  isOpen: boolean;
  errorCount: number;
  errors: ErrorItem[];
}

export const useErrorFeedback = () => {
  const [errorFeedback, setErrorFeedback] = useState<ErrorFeedbackState>({
    isOpen: false,
    errorCount: 0,
    errors: []
  });

  const showErrorFeedback = useCallback((errors: ErrorItem[]) => {
    setErrorFeedback({
      isOpen: true,
      errorCount: errors.length,
      errors
    });
  }, []);

  const hideErrorFeedback = useCallback(() => {
    setErrorFeedback(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const closeErrorFeedback = useCallback(() => {
    setErrorFeedback(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const resetErrorFeedback = useCallback(() => {
    setErrorFeedback({
      isOpen: false,
      errorCount: 0,
      errors: []
    });
  }, []);

  return {
    errorFeedback,
    showErrorFeedback,
    hideErrorFeedback,
    closeErrorFeedback,
    resetErrorFeedback
  };
};
