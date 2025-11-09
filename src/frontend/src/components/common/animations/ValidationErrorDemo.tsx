'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorFeedback } from '@/hooks/use-error-feedback';
import ErrorFeedbackModal from './ErrorFeedbackModal';
import { GitBranch, MessageSquare, Target, User } from 'lucide-react';

export default function ValidationErrorDemo() {
  const { errorFeedback, showErrorFeedback, closeErrorFeedback } = useErrorFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const simulateValidationError = (errorType: string) => {
    let errors: any[] = [];

    switch (errorType) {
      case 'commit':
        errors = [
          { type: 'commit', field: 'count', expected: 3, actual: 1 },
          { type: 'message', field: 'content', expected: 'Add new feature', actual: 'Fix typo' }
        ];
        break;
      case 'branch':
        errors = [
          { type: 'branch', field: 'name', expected: 'feature/new-feature', actual: 'main' },
          { type: 'commit', field: 'count', expected: 2, actual: 0 }
        ];
        break;
      case 'complex':
        errors = [
          { type: 'commit', field: 'count', expected: 5, actual: 2 },
          { type: 'branch', field: 'name', expected: 'develop', actual: 'main' },
          { type: 'message', field: 'content', expected: 'Implement authentication', actual: 'Add login' },
          { type: 'author', field: 'name', expected: 'John Doe', actual: 'Jane Smith' },
          { type: 'file', field: 'count', expected: 10, actual: 3 }
        ];
        break;
      default:
        errors = [
          { type: 'commit', field: 'count', expected: 2, actual: 1 }
        ];
    }

    showErrorFeedback(errors);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🔍 Validation Error Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mô phỏng các lỗi validation thực tế trong practice system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Lỗi Commit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Số lượng commit không đúng và nội dung commit sai
            </p>
            <Button 
              onClick={() => simulateValidationError('commit')}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Mô phỏng lỗi Commit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-500" />
              Lỗi Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Tên branch sai và số lượng commit trên branch không đúng
            </p>
            <Button 
              onClick={() => simulateValidationError('branch')}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Mô phỏng lỗi Branch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              Lỗi Phức Tạp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Nhiều loại lỗi khác nhau cùng lúc
            </p>
            <Button 
              onClick={() => simulateValidationError('complex')}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Mô phỏng lỗi phức tạp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Tích hợp với Practice System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                ✅ Tự động kích hoạt
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Error Modal sẽ tự động hiển thị khi validation trả về kết quả sai, thay thế cho thông báo kỹ thuật cũ.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                🎯 Thông tin rõ ràng
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Thay vì hiển thị raw data như "expected 2, got 1", modal sẽ hiển thị thông tin thân thiện và dễ hiểu.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                💡 Hướng dẫn tích cực
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Modal cung cấp lời khuyên khích lệ và nút "Xem gợi ý" để giúp người dùng cải thiện.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Feedback Modal */}
      <ErrorFeedbackModal
        isOpen={errorFeedback.isOpen}
        onClose={closeErrorFeedback}
        errorCount={errorFeedback.errorCount}
        errors={errorFeedback.errors}
        onRetry={() => {
          closeErrorFeedback();
          console.log('Retry validation');
        }}
        onViewHint={() => {
          closeErrorFeedback();
          console.log('View hint');
        }}
      />
    </div>
  );
}
