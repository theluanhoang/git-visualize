'use client';

import { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Monitor,
  Palette,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export default function DarkModeDemoPage() {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const themeOptions = [
    { value: 'light', label: 'Light Mode', icon: Sun, description: 'Giao diện sáng, phù hợp cho ban ngày' },
    { value: 'dark', label: 'Dark Mode', icon: Moon, description: 'Giao diện tối, dễ chịu cho mắt' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Tự động theo hệ thống' }
  ];

  const features = [
    {
      title: 'Automatic Theme Detection',
      description: 'Tự động phát hiện theme preference của người dùng',
      status: 'completed'
    },
    {
      title: 'CSS Variables Support',
      description: 'Sử dụng CSS custom properties cho consistent theming',
      status: 'completed'
    },
    {
      title: 'Component-level Dark Mode',
      description: 'Tất cả components đều hỗ trợ dark mode',
      status: 'completed'
    },
    {
      title: 'Smooth Transitions',
      description: 'Chuyển đổi mượt mà giữa các theme',
      status: 'completed'
    },
    {
      title: 'Accessibility Support',
      description: 'Đảm bảo contrast ratio phù hợp cho accessibility',
      status: 'completed'
    }
  ];

  const colorPalette = {
    light: {
      background: 'bg-white',
      foreground: 'text-gray-900',
      muted: 'text-gray-500',
      border: 'border-gray-200',
      accent: 'bg-blue-50 text-blue-700'
    },
    dark: {
      background: 'bg-gray-900',
      foreground: 'text-white',
      muted: 'text-gray-400',
      border: 'border-gray-700',
      accent: 'bg-blue-900/50 text-blue-300'
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dark Mode Demo</h1>
          <p className="text-muted-foreground">Khám phá tính năng dark mode của admin panel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Theme hiện tại:</span>
          <span className="text-sm font-medium text-foreground capitalize">{currentTheme}</span>
        </div>
      </div>

      {}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Chọn Theme</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentTheme === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <option.icon className="h-5 w-5 text-foreground" />
                <span className="font-medium text-foreground">{option.label}</span>
                {currentTheme === option.value && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-muted-foreground text-left">{option.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h2 className="text-lg font-semibold text-foreground">Tính năng Dark Mode</h2>
        </div>
        
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Color Palette</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light Mode
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded"></div>
                <span className="text-sm text-foreground">Background</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded"></div>
                <span className="text-sm text-foreground">Foreground</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded"></div>
                <span className="text-sm text-foreground">Muted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded"></div>
                <span className="text-sm text-foreground">Accent</span>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark Mode
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 border border-gray-700 rounded"></div>
                <span className="text-sm text-foreground">Background</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded"></div>
                <span className="text-sm text-foreground">Foreground</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <span className="text-sm text-foreground">Muted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-900/50 rounded"></div>
                <span className="text-sm text-foreground">Accent</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Buttons</h3>
          <div className="space-y-3">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
        </Card>

        {}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cards & Content</h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground">This is a muted card with foreground text</p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">This is a bordered card with muted text</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary">This is an accent card with primary text</p>
            </div>
          </div>
        </Card>
      </div>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Status Indicators</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-3 w-3 mr-1" />
            Info
          </span>
        </div>
      </Card>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Implementation Notes</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• Sử dụng CSS custom properties (CSS variables) để quản lý colors</p>
          <p>• Tất cả components sử dụng semantic color tokens (text-foreground, bg-background, etc.)</p>
          <p>• Dark mode được kích hoạt thông qua data-theme="dark" attribute</p>
          <p>• Smooth transitions cho tất cả color changes</p>
          <p>• Accessibility compliant với proper contrast ratios</p>
        </div>
      </Card>
    </div>
  );
}
