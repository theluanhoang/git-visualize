'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCelebrationContext } from '@/components/common/animations';
import ValidationCelebrationDemo from '@/components/common/animations/ValidationCelebrationDemo';
import ErrorFeedbackDemo from '@/components/common/animations/ErrorFeedbackDemo';
import ValidationErrorDemo from '@/components/common/animations/ValidationErrorDemo';
import InitialGuidanceDemo from '@/components/common/animations/InitialGuidanceDemo';
import PrivateRouteDemo from '@/components/auth/PrivateRouteDemo';
import { Trophy, Star, Zap, Sparkles } from 'lucide-react';

export default function CelebrationDemoPage() {
  const celebration = useCelebrationContext();

  const triggerQuickCelebration = () => {
    celebration.triggerQuickCelebration(
      '🎉 Tuyệt vời!',
      'Bạn đã hoàn thành bước đầu tiên!'
    );
  };

  const triggerSuccessCelebration = () => {
    celebration.triggerSuccessCelebration(
      '🏆 Chúc mừng!',
      'Bạn đã hoàn thành bài luyện tập một cách xuất sắc!',
      {
        label: 'Tiếp tục học tập',
        onClick: () => console.log('Continue learning')
      }
    );
  };

  const triggerEpicCelebration = () => {
    celebration.triggerEpicCelebration(
      '🌟 HOÀN HẢO!',
      'Bạn đã chinh phục được thử thách khó nhất! Hãy tiếp tục phát huy tài năng của mình!',
      {
        label: 'Chinh phục thử thách tiếp theo',
        onClick: () => console.log('Next challenge')
      }
    );
  };

  const triggerCustomCelebration = () => {
    celebration.triggerCelebration({
      title: '🎯 Thành tựu đặc biệt!',
      message: 'Bạn đã mở khóa được một kỹ năng mới!',
      actionLabel: 'Khám phá thêm',
      onAction: () => console.log('Explore more'),
      showFireworks: true,
      showConfetti: true,
      showSparkles: true,
      playSound: true,
      duration: 6000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Hệ thống Celebration Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Trải nghiệm các hiệu ứng phản hồi tích cực mạnh mẽ và đầy cảm xúc
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Celebration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Celebration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Hiệu ứng nhanh với confetti và sparkles, phù hợp cho các thành tựu nhỏ
              </p>
              <Button 
                onClick={triggerQuickCelebration}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Kích hoạt Quick Celebration
              </Button>
            </CardContent>
          </Card>

          {/* Success Celebration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                Success Celebration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Hiệu ứng đầy đủ với pháo hoa, confetti, sparkles và âm thanh
              </p>
              <Button 
                onClick={triggerSuccessCelebration}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Kích hoạt Success Celebration
              </Button>
            </CardContent>
          </Card>

          {/* Epic Celebration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Epic Celebration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Hiệu ứng mạnh mẽ nhất với thời gian dài và tất cả các yếu tố
              </p>
              <Button 
                onClick={triggerEpicCelebration}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Kích hoạt Epic Celebration
              </Button>
            </CardContent>
          </Card>

          {/* Custom Celebration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Custom Celebration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Tùy chỉnh hoàn toàn các hiệu ứng và thông báo
              </p>
              <Button 
                onClick={triggerCustomCelebration}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                Kích hoạt Custom Celebration
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Validation Celebration Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🎯 Validation Celebration Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationCelebrationDemo />
          </CardContent>
        </Card>

        {/* Error Feedback Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🚨 Error Feedback Modal Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorFeedbackDemo />
          </CardContent>
        </Card>

        {/* Validation Error Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🔍 Validation Error Integration Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationErrorDemo />
          </CardContent>
        </Card>

        {/* Initial Guidance Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🚀 Initial Guidance Modal Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <InitialGuidanceDemo />
          </CardContent>
        </Card>

        {/* Private Route Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🔒 Private Route System Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <PrivateRouteDemo />
          </CardContent>
        </Card>

        {/* Features List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">🌟 Tính năng Celebration System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Hiệu ứng thị giác</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Pháo hoa rực rỡ với nhiều màu sắc</li>
                  <li>• Confetti rơi xuống với nhiều hình dạng</li>
                  <li>• Sparkles lấp lánh khắp màn hình</li>
                  <li>• Animation mượt mà với Framer Motion</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Phản hồi âm thanh</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Victory jingle vui tai</li>
                  <li>• Âm thanh pháo hoa nổ</li>
                  <li>• Tiếng confetti tinh tế</li>
                  <li>• Success chime khích lệ</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600 dark:text-purple-400">Thông báo thông minh</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Ngôn ngữ khích lệ mạnh mẽ</li>
                  <li>• Thông báo động với nhiều thông điệp</li>
                  <li>• Icon và emoji sinh động</li>
                  <li>• Tùy chỉnh hoàn toàn</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600 dark:text-orange-400">Tích hợp dễ dàng</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Hook đơn giản để sử dụng</li>
                  <li>• Context provider toàn cục</li>
                  <li>• Tự động tích hợp với feedback system</li>
                  <li>• Responsive và accessible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
