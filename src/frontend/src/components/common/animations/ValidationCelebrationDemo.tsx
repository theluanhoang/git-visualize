'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useValidationCelebration } from '@/hooks/use-validation-celebration';
import { Target, Star } from 'lucide-react';

export default function ValidationCelebrationDemo() {
  const { triggerValidationCelebration } = useValidationCelebration();

  const simulateValidation = (message: string) => {
    triggerValidationCelebration({
      isCorrect: true,
      message
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🎯 Validation Celebration Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mô phỏng kết quả validation thành công để xem celebration system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Validation Thành Công
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => simulateValidation('Bạn đã hoàn thành chính xác!')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              🎉 Kích hoạt Celebration
            </Button>
            
            <Button 
              onClick={() => simulateValidation('Tuyệt vời! Bạn đã làm đúng!')}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              🌟 Celebration với thông điệp tùy chỉnh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Thông tin Celebration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Khi validation thành công:</strong>
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                <li>• 🌟 Epic Celebration với tất cả hiệu ứng</li>
                <li>• 🎆 Pháo hoa + Confetti + Sparkles</li>
                <li>• 🔊 Âm thanh victory đầy đủ</li>
                <li>• ⏱️ Thời gian: 8 giây</li>
                <li>• 💬 Thông điệp: "Chúc Mừng! Hoàn Thành!"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Info */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Hệ thống Celebration Đơn giản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Khi Đúng</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Luôn kích hoạt Epic Celebration</li>
                <li>• Tất cả hiệu ứng: Pháo hoa + Confetti + Sparkles</li>
                <li>• Âm thanh victory đầy đủ</li>
                <li>• Thông điệp khích lệ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Khi Sai</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Hiển thị Error Modal thân thiện</li>
                <li>• Thông tin lỗi rõ ràng và dễ hiểu</li>
                <li>• Lời khuyên tích cực</li>
                <li>• Nút "Thử lại" và "Xem gợi ý"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}