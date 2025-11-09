import { useCallback } from 'react';
import { useCelebrationContext } from '@/components/common/animations';

interface ValidationResult {
  isCorrect: boolean;
  score?: number;
  message?: string;
  feedback?: string;
}

export const useValidationCelebration = () => {
  const celebration = useCelebrationContext();

  const triggerValidationCelebration = useCallback((result: ValidationResult) => {
    if (!result.isCorrect) {
      return; // Không có celebration cho kết quả sai
    }

    const message = result.message || '';

    // Chỉ có 2 trạng thái: đúng hoặc sai
    // Khi đúng, luôn kích hoạt epic celebration
    celebration.triggerEpicCelebration(
      '🎉 Chúc Mừng! Hoàn Thành!',
      `Bạn đã hoàn thành chính xác! ${message}`,
      {
        label: 'Tiếp tục luyện tập',
        onClick: () => {
          console.log('Continue practice');
        }
      }
    );
  }, [celebration]);


  return {
    triggerValidationCelebration
  };
};
