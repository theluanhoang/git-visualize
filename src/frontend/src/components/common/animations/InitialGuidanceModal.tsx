'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Lightbulb, Target, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InitialGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  practiceTitle?: string;
  firstCommand?: string;
  guidanceMessage?: string;
}

export default function InitialGuidanceModal({
  isOpen,
  onClose,
  onStart,
  practiceTitle = "Bài Luyện Tập",
  firstCommand = "git init",
  guidanceMessage = "Hãy gõ câu lệnh đầu tiên của bạn vào terminal để bắt đầu bài học!"
}: InitialGuidanceModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-pink-600/30 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-2xl"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-600 shadow-2xl overflow-hidden">
            {/* Header với animation */}
            <CardHeader className="relative pb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  >
                    <Play className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">
                      🚀 Sẵn Sàng Bắt Đầu Luyện Tập?
                    </CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      {practiceTitle}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Floating Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${10 + (i % 3) * 25}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 180, 360],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </motion.div>
                ))}
              </div>

              {/* Main Content */}
              <div className="relative space-y-4">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        Chào mừng bạn đến với bài học!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Hiện tại hệ thống chưa phát hiện câu lệnh nào được thực thi. 
                        Hãy bắt đầu ngay để xem kết quả tuyệt vời nhé! 🌟
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guidance Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        Hướng dẫn bắt đầu
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        {guidanceMessage}
                      </p>
                      
                      {/* Command Example */}
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ví dụ câu lệnh đầu tiên:
                          </span>
                        </div>
                        <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-blue-600 dark:text-blue-400 font-mono">
                          {firstCommand}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        💡 Mẹo nhỏ
                      </h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Gõ câu lệnh vào terminal bên dưới</li>
                        <li>• Nhấn Enter để thực thi</li>
                        <li>• Sử dụng nút "Validate" để kiểm tra kết quả</li>
                        <li>• Đừng ngại thử nghiệm và học hỏi!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={onStart}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Bắt Đầu Ngay!
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  Tôi sẽ tự khám phá
                </Button>
              </div>

              {/* Encouragement */}
              <div className="text-center">
                <motion.p
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-gray-600 dark:text-gray-400 italic"
                >
                  "Mỗi chuyên gia đều từng là người mới bắt đầu. Hãy bắt đầu hành trình của bạn ngay hôm nay! 🌟"
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
