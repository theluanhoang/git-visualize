'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorFeedbackModal from './ErrorFeedbackModal';
import { AlertTriangle, GitBranch, MessageSquare, User } from 'lucide-react';

export default function ErrorFeedbackDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentErrors, setCurrentErrors] = useState<any[]>([]);

  const simulateCommitErrors = () => {
    const errors = [
      { type: 'commit', field: 'count', expected: 2, actual: 1 },
      { type: 'message', field: 'content', expected: 'Add new feature', actual: 'Fix bug' },
      { type: 'author', field: 'name', expected: 'John Doe', actual: 'Jane Smith' }
    ];
    setCurrentErrors(errors);
    setIsModalOpen(true);
  };

  const simulateBranchErrors = () => {
    const errors = [
      { type: 'branch', field: 'name', expected: 'feature/new-feature', actual: 'main' },
      { type: 'commit', field: 'count', expected: 3, actual: 1 }
    ];
    setCurrentErrors(errors);
    setIsModalOpen(true);
  };

  const simulateFileErrors = () => {
    const errors = [
      { type: 'file', field: 'count', expected: 5, actual: 2 },
      { type: 'file', field: 'name', expected: 'app.js', actual: 'index.js' },
      { type: 'commit', field: 'count', expected: 2, actual: 1 },
      { type: 'message', field: 'content', expected: 'Update documentation', actual: 'Fix typo' }
    ];
    setCurrentErrors(errors);
    setIsModalOpen(true);
  };

  const simulateComplexErrors = () => {
    const errors = [
      { type: 'commit', field: 'count', expected: 5, actual: 2 },
      { type: 'branch', field: 'name', expected: 'develop', actual: 'main' },
      { type: 'message', field: 'content', expected: 'Implement user authentication', actual: 'Add login form' },
      { type: 'author', field: 'email', expected: 'john@example.com', actual: 'jane@example.com' },
      { type: 'file', field: 'count', expected: 10, actual: 3 },
      { type: 'commit', field: 'hash', expected: 'abc123', actual: 'def456' }
    ];
    setCurrentErrors(errors);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🚨 Error Feedback Modal Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mô phỏng các loại lỗi validation khác nhau để xem Error Feedback Modal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Lỗi Commit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Mô phỏng lỗi về số lượng commit, nội dung commit và thông tin tác giả
            </p>
            <Button 
              onClick={simulateCommitErrors}
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
              Mô phỏng lỗi về tên branch và số lượng commit trên branch
            </p>
            <Button 
              onClick={simulateBranchErrors}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Mô phỏng lỗi Branch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Lỗi File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Mô phỏng lỗi về số lượng file, tên file và các thông tin khác
            </p>
            <Button 
              onClick={simulateFileErrors}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Mô phỏng lỗi File
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Lỗi Phức Tạp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Mô phỏng nhiều loại lỗi khác nhau cùng lúc
            </p>
            <Button 
              onClick={simulateComplexErrors}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Mô phỏng lỗi phức tạp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Tính năng Error Feedback Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">🎯 Thông tin rõ ràng</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Tiêu đề thân thiện và khích lệ</li>
                <li>• Tóm tắt số lượng lỗi</li>
                <li>• Phân loại lỗi theo loại</li>
                <li>• So sánh rõ ràng Expected vs Current</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🎨 Thiết kế thân thiện</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Màu sắc cảnh báo nhưng không gây sợ hãi</li>
                <li>• Icon phân biệt các loại lỗi</li>
                <li>• Animation mượt mà</li>
                <li>• Responsive và accessible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">💡 Hướng dẫn tích cực</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Lời khuyên khích lệ</li>
                <li>• Hướng dẫn cụ thể</li>
                <li>• Nút thử lại và xem gợi ý</li>
                <li>• Thông điệp động dựa trên số lỗi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">🔧 Tích hợp dễ dàng</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Hook quản lý state</li>
                <li>• Parse tự động từ validation message</li>
                <li>• Tùy chỉnh hoàn toàn</li>
                <li>• Tích hợp với existing feedback system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Feedback Modal */}
      <ErrorFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        errorCount={currentErrors.length}
        errors={currentErrors}
        onRetry={() => {
          setIsModalOpen(false);
          console.log('Retry clicked');
        }}
        onViewHint={() => {
          setIsModalOpen(false);
          console.log('View hint clicked');
        }}
      />
    </div>
  );
}
