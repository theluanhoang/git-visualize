'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-2 sm:px-4 shadow-sm sm:gap-x-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-2 lg:gap-x-6">
          <div className="flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">A</span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
