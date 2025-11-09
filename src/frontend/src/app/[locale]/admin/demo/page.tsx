'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  BarChart3,
  Users,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminDemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: 'Chào mừng đến với Admin Panel',
      description: 'Đây là hệ thống quản lý toàn diện cho nền tảng học Git',
      icon: <Info className="h-8 w-8 text-blue-600" />,
      features: [
        'Dashboard tổng quan với thống kê real-time',
        'Quản lý bài học với rich text editor',
        'Quản lý người dùng và phân quyền',
        'Analytics và báo cáo chi tiết',
        'Cài đặt hệ thống linh hoạt'
      ]
    },
    {
      title: 'Dashboard & Thống kê',
      description: 'Theo dõi hiệu suất hệ thống và hoạt động người dùng',
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      features: [
        'Tổng quan số liệu quan trọng',
        'Biểu đồ tăng trưởng người dùng',
        'Thống kê bài học phổ biến',
        'Báo cáo hoạt động theo thời gian',
        'Xuất báo cáo PDF/Excel'
      ]
    },
    {
      title: 'Quản lý Bài học',
      description: 'Tạo và quản lý nội dung học tập một cách chuyên nghiệp',
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      features: [
        'Rich text editor với đầy đủ tính năng',
        'Quản lý code examples và syntax highlighting',
        'Hệ thống phân loại và tags',
        'Preview trực tiếp bài học',
        'Quản lý phiên bản và lịch sử'
      ]
    },
    {
      title: 'Quản lý Người dùng',
      description: 'Kiểm soát và hỗ trợ người dùng hiệu quả',
      icon: <Users className="h-8 w-8 text-orange-600" />,
      features: [
        'Danh sách người dùng với tìm kiếm nâng cao',
        'Phân quyền và vai trò linh hoạt',
        'Theo dõi tiến độ học tập',
        'Gửi thông báo và email',
        'Quản lý báo cáo và khiếu nại'
      ]
    },
    {
      title: 'Analytics & Báo cáo',
      description: 'Phân tích dữ liệu để tối ưu hóa trải nghiệm học tập',
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      features: [
        'Phân tích hành vi người dùng',
        'Báo cáo hiệu suất bài học',
        'Thống kê thiết bị và trình duyệt',
        'Phân tích thời gian học tập',
        'Dự đoán xu hướng và đề xuất'
      ]
    }
  ];

  const handleNext = () => {
    if (demoStep < demoSteps.length - 1) {
      setDemoStep(demoStep + 1);
    }
  };

  const handlePrev = () => {
    if (demoStep > 0) {
      setDemoStep(demoStep - 1);
    }
  };

  const handleReset = () => {
    setDemoStep(0);
    setIsRunning(false);
  };

  const currentStep = demoSteps[demoStep];

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demo Admin Panel</h1>
          <p className="text-gray-600">Khám phá các tính năng của hệ thống quản lý</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Bắt đầu
              </>
            )}
          </Button>
        </div>
      </div>

      {}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Bước {demoStep + 1} / {demoSteps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((demoStep + 1) / demoSteps.length) * 100)}% hoàn thành
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((demoStep + 1) / demoSteps.length) * 100}%` }}
          ></div>
        </div>
      </Card>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {currentStep.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {currentStep.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tính năng chính:</h3>
              <ul className="space-y-3">
                {currentStep.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={demoStep === 0}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={demoStep === demoSteps.length - 1}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {}
        <div className="space-y-6">
          {}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng bài học</span>
                <span className="text-sm font-medium text-gray-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Người dùng</span>
                <span className="text-sm font-medium text-gray-900">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lượt xem</span>
                <span className="text-sm font-medium text-gray-900">15,689</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                <span className="text-sm font-medium text-green-600">68.5%</span>
              </div>
            </div>
          </Card>

          {}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Tạo bài học mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Xem người dùng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Xem báo cáo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </Card>

          {}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mẹo sử dụng</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Sử dụng bộ lọc để tìm kiếm nhanh</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Lưu bản nháp thường xuyên</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Kiểm tra analytics định kỳ</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Các bước demo</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {demoSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => setDemoStep(index)}
              className={`p-3 rounded-lg text-left transition-colors ${
                index === demoStep
                  ? 'bg-blue-100 border-blue-500 border-2'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${
                  index === demoStep ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-900">
                  Bước {index + 1}
                </span>
              </div>
              <p className="text-xs text-gray-600">{step.title}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
