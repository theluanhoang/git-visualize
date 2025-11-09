'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitialGuidance } from '@/hooks/use-initial-guidance';
import InitialGuidanceModal from './InitialGuidanceModal';
import { Play, GitBranch, Code, Database } from 'lucide-react';

export default function InitialGuidanceDemo() {
  const { guidanceState, showInitialGuidance, closeInitialGuidance } = useInitialGuidance();

  const simulateGitPractice = () => {
    showInitialGuidance({
      practiceTitle: "Git Basics - Tạo Repository",
      firstCommand: "git init",
      guidanceMessage: "Hãy gõ câu lệnh git init để khởi tạo kho lưu trữ và bắt đầu bài học!"
    });
  };

  const simulateBranchPractice = () => {
    showInitialGuidance({
      practiceTitle: "Git Branching - Tạo và Chuyển đổi Branch",
      firstCommand: "git branch feature/new-feature",
      guidanceMessage: "Hãy tạo một branch mới để bắt đầu phát triển tính năng mới!"
    });
  };

  const simulateCommitPractice = () => {
    showInitialGuidance({
      practiceTitle: "Git Commit - Lưu trữ thay đổi",
      firstCommand: "git add . && git commit -m 'Initial commit'",
      guidanceMessage: "Hãy thêm và commit các thay đổi để lưu trữ công việc của bạn!"
    });
  };

  const simulateCustomPractice = () => {
    showInitialGuidance({
      practiceTitle: "Bài Luyện Tập Tùy Chỉnh",
      firstCommand: "npm install",
      guidanceMessage: "Hãy cài đặt các dependencies cần thiết để bắt đầu dự án!"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🚀 Initial Guidance Modal Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mô phỏng modal hướng dẫn ban đầu cho các loại bài luyện tập khác nhau
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-500" />
              Git Init Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Modal hướng dẫn cho bài tập khởi tạo Git repository
            </p>
            <Button 
              onClick={simulateGitPractice}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Demo Git Init
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-500" />
              Git Branch Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Modal hướng dẫn cho bài tập tạo và quản lý branch
            </p>
            <Button 
              onClick={simulateBranchPractice}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Demo Git Branch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-500" />
              Git Commit Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Modal hướng dẫn cho bài tập commit và lưu trữ thay đổi
            </p>
            <Button 
              onClick={simulateCommitPractice}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Demo Git Commit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Custom Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Modal hướng dẫn cho bài tập tùy chỉnh với lệnh khác
            </p>
            <Button 
              onClick={simulateCustomPractice}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Demo Custom
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Tính năng Initial Guidance Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🎯 Hướng dẫn thân thiện</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Tiêu đề khích lệ và tích cực</li>
                <li>• Giải thích rõ ràng tại sao modal xuất hiện</li>
                <li>• Hướng dẫn cụ thể bước tiếp theo</li>
                <li>• Ví dụ câu lệnh đầu tiên</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">🎨 Thiết kế hấp dẫn</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Màu sắc tươi sáng và gradient</li>
                <li>• Animation mượt mà với floating elements</li>
                <li>• Icon và emoji sinh động</li>
                <li>• Tông giọng thân thiện, không cảnh báo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">💡 Tương tác thông minh</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Nút "Bắt Đầu Ngay!" để focus vào terminal</li>
                <li>• Nút "Tôi sẽ tự khám phá" để đóng modal</li>
                <li>• Mẹo nhỏ và lời khuyên hữu ích</li>
                <li>• Thông điệp động viên cuối modal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">🔧 Tích hợp dễ dàng</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Hook quản lý state đơn giản</li>
                <li>• Tùy chỉnh hoàn toàn nội dung</li>
                <li>• Tự động hiển thị khi chưa có hành động</li>
                <li>• Thay thế thông báo kỹ thuật khô khan</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Tích hợp với Practice System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                ✅ Khi nào hiển thị
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Modal sẽ tự động hiển thị khi người dùng nhấn "Validate" nhưng chưa thực hiện bất kỳ hành động nào (repoState = null).
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                🎯 Thay thế thông báo kỹ thuật
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Thay vì hiển thị "Nothing to validate, Initialize the repository and try again", modal sẽ hiển thị hướng dẫn thân thiện và khích lệ.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                💡 Tùy chỉnh nội dung
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Có thể tùy chỉnh tiêu đề bài tập, câu lệnh đầu tiên và thông điệp hướng dẫn cho từng loại bài luyện tập khác nhau.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initial Guidance Modal */}
      <InitialGuidanceModal
        isOpen={guidanceState.isOpen}
        onClose={closeInitialGuidance}
        onStart={() => {
          closeInitialGuidance();
          console.log('Start practice');
        }}
        practiceTitle={guidanceState.practiceTitle}
        firstCommand={guidanceState.firstCommand}
        guidanceMessage={guidanceState.guidanceMessage}
      />
    </div>
  );
}
