'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Lightbulb, Target, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorItem {
  type: string;
  field: string;
  expected: string | number;
  actual: string | number;
}

interface ErrorFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCount: number;
  errors: ErrorItem[];
  onRetry?: () => void;
  onViewHint?: () => void;
}

const getErrorTypeInfo = (type: string, field: string) => {
  const typeMap: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
    'commit': {
      title: 'Số lượng Commit',
      icon: <Target className="h-4 w-4" />,
      color: 'text-blue-600 dark:text-blue-400'
    },
    'branch': {
      title: 'Chi nhánh Git',
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600 dark:text-green-400'
    },
    'message': {
      title: 'Nội dung Commit',
      icon: <Info className="h-4 w-4" />,
      color: 'text-purple-600 dark:text-purple-400'
    },
    'author': {
      title: 'Thông tin Tác giả',
      icon: <Info className="h-4 w-4" />,
      color: 'text-orange-600 dark:text-orange-400'
    },
    'file': {
      title: 'Tệp tin',
      icon: <Target className="h-4 w-4" />,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    'error': {
      title: 'Lỗi Hệ Thống',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400'
    },
    'server': {
      title: 'Kết Nối Server',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400'
    }
  };

  return typeMap[type] || {
    title: field,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-gray-600 dark:text-gray-400'
  };
};

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

const getEncouragingMessage = (errorCount: number): string => {
  if (errorCount === 1) {
    return "Bạn gần đạt được rồi! Chỉ cần điều chỉnh một chút nữa thôi! 💪";
  } else if (errorCount <= 3) {
    return "Đừng nản lòng! Hãy xem lại yêu cầu và thử lại. Bạn đang tiến bộ rất tốt! 🌟";
  } else {
    return "Hãy từ từ, xem lại từng bước một. Mỗi lần thử là một lần học hỏi! 📚";
  }
};

export default function ErrorFeedbackModal({
  isOpen,
  onClose,
  errorCount,
  errors,
  onRetry,
  onViewHint
}: ErrorFeedbackModalProps) {
  if (!isOpen) return null;

  const encouragingMessage = getEncouragingMessage(errorCount);

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
          className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-700 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-orange-800 dark:text-orange-200">
                    Bạn Cần Thực Hiện Thêm!
                  </CardTitle>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                    Hệ thống đã phát hiện {errorCount} điểm khác biệt so với mục tiêu
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Summary */}
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                      Tóm tắt kết quả
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Kết quả của bạn chưa khớp hoàn toàn với yêu cầu. Hãy xem chi tiết bên dưới để biết cần điều chỉnh gì.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Chi tiết các điểm cần điều chỉnh
                </h4>
                
                <div className="space-y-3">
                  {errors.map((error, index) => {
                    const typeInfo = getErrorTypeInfo(error.type, error.field);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                {typeInfo.title}
                              </h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Yêu cầu
                                  </span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  {formatValue(error.expected)}
                                </p>
                              </div>
                              
                              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Hiện tại
                                  </span>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  {formatValue(error.actual)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Encouraging Message */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      Lời khuyên
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {encouragingMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={onRetry}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
                
                {onViewHint && (
                  <Button
                    onClick={onViewHint}
                    variant="outline"
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Xem gợi ý
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
