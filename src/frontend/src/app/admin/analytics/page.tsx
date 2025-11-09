'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Eye, 
  Clock,
  Download,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, StatCard, AdminTabs, MetricCard, TopLessonsCard, SegmentChart, ActivityTimeline, AchievementsCard, ActivityHeatmap } from '@/components/admin';
import { useDashboardStats, useAnalyticsMetrics } from '@/lib/react-query/hooks/use-analytics';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { formatTimeVietnamese } from '@/utils/format-time';

export const dynamic = 'force-dynamic';

const timeRangeOptions = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '90d', label: '90 ngày qua' },
  { value: '1y', label: '1 năm qua' }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics();
  const { data: allLessons = [], isLoading: lessonsLoading } = useLessons({ limit: 100 });
  
  const analyticsData = useMemo(() => {
    const topLessons = [...allLessons]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((lesson, index) => ({
        id: lesson.id || index,
        title: lesson.title,
        views: lesson.views || 0,
        completionRate: 0, 
        rating: 0 
      }));

    const totalViews = allLessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0);
    
    const completionRate = allLessons.length > 0 ? 68.5 : 0;
    
    return {
      overview: {
        totalUsers: stats?.totalUsers || 0,
        totalLessons: stats?.totalLessons || 0,
        totalViews: stats?.totalViews || totalViews,
        totalTimeSpent: metrics?.totalTimeSpent || { hours: 0, minutes: 0 },
        averageSessionTime: metrics?.averageSessionTime || { hours: 0, minutes: 0 },
        completionRate: metrics?.completionRate || completionRate,
        userGrowth: 12.3, 
        lessonViews: 8.7, 
        engagementRate: metrics?.engagementRate || 0
      },
      topLessons,
      userActivity: [
        { date: '2024-01-15', users: 45, lessons: 12, views: 234 },
        { date: '2024-01-16', users: 52, lessons: 15, views: 287 },
        { date: '2024-01-17', users: 48, lessons: 18, views: 312 },
        { date: '2024-01-18', users: 61, lessons: 22, views: 356 },
        { date: '2024-01-19', users: 58, lessons: 19, views: 298 },
        { date: '2024-01-20', users: 67, lessons: 25, views: 389 },
        { date: '2024-01-21', users: 73, lessons: 28, views: 412 }
      ],
      userSegments: [
        { segment: 'Học viên mới', count: 234, percentage: 18.8 },
        { segment: 'Học viên tích cực', count: 456, percentage: 36.6 },
        { segment: 'Học viên nâng cao', count: 298, percentage: 23.9 },
        { segment: 'Học viên hoàn thành', count: 259, percentage: 20.7 }
      ],
      deviceStats: [
        { device: 'Desktop', count: 892, percentage: 71.5 },
        { device: 'Mobile', count: 267, percentage: 21.4 },
        { device: 'Tablet', count: 88, percentage: 7.1 }
      ],
      timeStats: [
        { hour: '00:00', users: 12 },
        { hour: '02:00', users: 8 },
        { hour: '04:00', users: 5 },
        { hour: '06:00', users: 15 },
        { hour: '08:00', users: 45 },
        { hour: '10:00', users: 78 },
        { hour: '12:00', users: 92 },
        { hour: '14:00', users: 85 },
        { hour: '16:00', users: 67 },
        { hour: '18:00', users: 89 },
        { hour: '20:00', users: 95 },
        { hour: '22:00', users: 34 }
      ]
    };
  }, [stats, metrics, allLessons]);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'engagement', label: 'Tương tác', icon: Activity }
  ];
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Báo cáo"
        description="Phân tích hiệu suất và thống kê hệ thống"
        actions={
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        }
      />

      <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng người dùng"
              value={statsLoading ? '...' : analyticsData.overview.totalUsers}
              icon={Users}
              color="text-blue-500"
              trend={{
                value: analyticsData.overview.userGrowth
              }}
            />
            <StatCard
              title="Tổng bài học"
              value={statsLoading ? '...' : analyticsData.overview.totalLessons}
              icon={BookOpen}
              color="text-green-500"
              trend={{
                value: analyticsData.overview.lessonViews
              }}
            />
            <StatCard
              title="Tổng lượt xem"
              value={statsLoading ? '...' : analyticsData.overview.totalViews.toLocaleString('vi-VN')}
              icon={Eye}
              color="text-purple-500"
            />
            <StatCard
              title="Thời gian học"
              value={formatTimeVietnamese(analyticsData.overview.totalTimeSpent)}
              icon={Clock}
              color="text-orange-500"
            />
          </div>

          {}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <MetricCard
              title="Tỷ lệ hoàn thành"
              value={`${analyticsData.overview.completionRate}%`}
              icon={Target}
              color="text-blue-600"
              description="Tỷ lệ hoàn thành bài học trung bình"
              progress={analyticsData.overview.completionRate}
            />
            <MetricCard
              title="Thời gian phiên"
              value={formatTimeVietnamese(analyticsData.overview.averageSessionTime)}
              icon={Clock}
              color="text-green-600"
              description="Thời gian trung bình mỗi phiên học"
            />
            <MetricCard
              title="Tỷ lệ tương tác"
              value={`${analyticsData.overview.engagementRate}%`}
              icon={Activity}
              color="text-purple-600"
              description="Tỷ lệ người dùng tương tác tích cực"
            />
          </div>

          {}
          {lessonsLoading ? (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">Đang tải dữ liệu...</div>
            </Card>
          ) : (
            <TopLessonsCard lessons={analyticsData.topLessons} />
          )}
        </div>
      )}

      {}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SegmentChart 
              segments={analyticsData.userSegments} 
              title="Phân khúc người dùng" 
              color="bg-blue-600"
            />
            <SegmentChart 
              segments={analyticsData.deviceStats} 
              title="Thiết bị sử dụng" 
              color="bg-green-600"
            />
          </div>

          {}
          <ActivityHeatmap timeStats={analyticsData.timeStats} />
        </div>
      )}

      {}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Hiệu suất bài học</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bài học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Thời gian TB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analyticsData.topLessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        Chưa có dữ liệu bài học
                      </td>
                    </tr>
                  ) : (
                    analyticsData.topLessons.map((lesson, index) => (
                      <tr 
                        key={lesson.id} 
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{lesson.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">{lesson.views.toLocaleString('vi-VN')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${lesson.completionRate || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground font-medium min-w-[3rem]">{lesson.completionRate || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-foreground">{lesson.rating > 0 ? `⭐ ${lesson.rating}` : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">24 phút</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivityTimeline activities={analyticsData.userActivity} />
            <AchievementsCard />
          </div>
        </div>
      )}
    </div>
  );
}
