'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Plus,
  FileText,
  UserCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NavigationItem, QuickAction } from './types';
import { useTranslations } from 'next-intl';


interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}: AdminSidebarProps) {
  const t = useTranslations('admin');
  
  const navigation: NavigationItem[] = [
    { name: t('dashboard.title'), href: '/admin', icon: LayoutDashboard },
    { name: t('lessons'), href: '/admin/lessons', icon: BookOpen },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('analytics.title'), href: '/admin/analytics', icon: BarChart3 },
    { name: t('settings.general'), href: '/admin/settings', icon: Settings },
  ];

  const quickActions: QuickAction[] = [
    { name: t('createNew'), href: '/admin/lessons/new', icon: Plus },
    { name: t('viewReports'), href: '/admin/analytics', icon: TrendingUp },
    { name: t('manageUsers'), href: '/admin/users', icon: UserCheck },
  ];
  const pathname = usePathname();

  return (
    <>
      {}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-card shadow-xl border-r border-border">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <div className="flex h-16 items-center justify-between px-2 lg:px-4 border-b border-border">
            <div className="flex items-center gap-3">
              {!sidebarCollapsed && (
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Admin Panel</h1>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="shrink-0 hover:bg-accent hover:text-accent-foreground"
              title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-1 lg:px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-4 w-4 lg:h-5 lg:w-5", !sidebarCollapsed && "mr-2 lg:mr-3")} />
                  {!sidebarCollapsed && item.name}
                </Link>
              );
            })}
          </nav>
          
          {}
          {!sidebarCollapsed && (
            <div className="px-1 lg:px-2 py-4 border-t border-border">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thao tác nhanh
            </h3>
            <div className="mt-2 space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <action.icon className="mr-2 lg:mr-3 h-4 w-4" />
                  {action.name}
                </Link>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
