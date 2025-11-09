'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
import { PageHeader, StatCard, AdminTabs, MetricCard, TopLessonsCard, SegmentChart, ActivityTimeline, AchievementsCard, ActivityHeatmap, DevicePieChart } from '@/components/admin';
import { DatePicker } from '@/components/common/DatePicker';
import { useTranslations } from 'next-intl';
import { useDashboardStats, useAnalyticsMetrics, useUsers, useDeviceUsage, useHourlyActivity } from '@/lib/react-query/hooks/use-analytics';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { formatTimeWithI18n } from '@/utils/format-time';
import { SearchParamsProvider } from '@/components/common';

export const dynamic = 'force-dynamic';

function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const t = useTranslations('admin.analytics');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics();
  const { data: usersData } = useUsers({ page: 1, limit: 1000, sortBy: 'createdAt', sortOrder: 'DESC' });
  const [activityDate, setActivityDate] = useState<string>('');
  const { data: deviceUsage = [] } = useDeviceUsage();
  const { data: hourlyActivity = [] } = useHourlyActivity(activityDate || undefined);
  const { data: allLessons = [], isLoading: lessonsLoading } = useLessons({ limit: 100 });
  
  const analyticsData = useMemo(() => {
    const totalUsers = stats?.totalUsers || usersData?.total || 1;
    const users = usersData?.users || [];
    
    const lessonPerformance = [...allLessons]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .map((lesson) => {
        const completedUsersCount = (lesson as any).completedUsersCount || 0;
        const completionRate = totalUsers > 0 
          ? Math.round((completedUsersCount / totalUsers) * 100 * 10) / 10 
          : 0;
        
        return {
          id: lesson.id || '',
          title: lesson.title,
          views: lesson.views || 0,
          completionRate,
          rating: lesson.averageRating || 0 
        };
      });
    
    const topLessons = lessonPerformance.slice(0, 5);

    const totalViews = allLessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0);
    
    const completionRate = allLessons.length > 0 ? 68.5 : 0;

    const statusCounts = users.reduce((acc: Record<string, number>, u: any) => {
      const s = (u.status || '').toString().toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const roleCounts = users.reduce((acc: Record<string, number>, u: any) => {
      const r = (u.role || '').toString().toUpperCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
    const activeCount = statusCounts['active'] || 0;
    const advancedCount = roleCounts['INSTRUCTOR'] || 0; // example mapping
    const completedCount = Math.max(0, Math.round((metrics?.completionRate || 0) * totalUsers / 100));
    const newStudentsCount = Math.max(0, (users.length >= totalUsers ? 0 : totalUsers - users.length));

    const userSegmentsReal = [
      { segment: t('newStudents'), count: newStudentsCount, percentage: totalUsers ? Math.round((newStudentsCount / totalUsers) * 1000) / 10 : 0 },
      { segment: t('activeStudents'), count: activeCount, percentage: totalUsers ? Math.round((activeCount / totalUsers) * 1000) / 10 : 0 },
      { segment: t('advancedStudents'), count: advancedCount, percentage: totalUsers ? Math.round((advancedCount / totalUsers) * 1000) / 10 : 0 },
      { segment: t('completedStudents'), count: completedCount, percentage: totalUsers ? Math.round((completedCount / totalUsers) * 1000) / 10 : 0 }
    ];
    
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
      lessonPerformance,
      userActivity: [
        { date: '2024-01-15', users: 45, lessons: 12, views: 234 },
        { date: '2024-01-16', users: 52, lessons: 15, views: 287 },
        { date: '2024-01-17', users: 48, lessons: 18, views: 312 },
        { date: '2024-01-18', users: 61, lessons: 22, views: 356 },
        { date: '2024-01-19', users: 58, lessons: 19, views: 298 },
        { date: '2024-01-20', users: 67, lessons: 25, views: 389 },
        { date: '2024-01-21', users: 73, lessons: 28, views: 412 }
      ],
      userSegments: userSegmentsReal,
      deviceStats: (() => {
        const cleaned = deviceUsage.filter(d => d.device !== 'Unknown' && d.device !== 'Bot');
        const total = cleaned.reduce((s, d) => s + (d.count || 0), 0) || 1;
        const mapLabel = (d: string) => d.toLowerCase() === 'desktop' ? t('desktop') : d.toLowerCase() === 'mobile' ? t('mobile') : d.toLowerCase() === 'tablet' ? t('tablet') : d;
        return cleaned.map(d => ({ device: mapLabel(d.device), count: d.count, percentage: Math.round((d.count / total) * 1000) / 10 }));
      })(),
      timeStats: (hourlyActivity.length ? hourlyActivity : Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2,'0')}:00`, users: 0 })))
    };
  }, [stats, metrics, allLessons, deviceUsage, hourlyActivity, t]);

  const timeRangeOptions = [
    { value: '7d', label: t('last7Days') },
    { value: '30d', label: t('last30Days') },
    { value: '90d', label: t('last90Days') },
    { value: '1y', label: t('lastYear') }
  ];

  const tabs = [
    { id: 'overview', label: t('overview'), icon: BarChart3 },
    { id: 'lessons', label: t('lessons'), icon: BookOpen },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'engagement', label: t('engagement'), icon: Activity }
  ];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`${pathname}?${params.toString()}`);
  }, [activeTab, pathname, router, searchParams]);
  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('title')}
        description={t('description')}
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
              {t('exportReport')}
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
              title={t('totalUsers')}
              value={statsLoading ? '...' : analyticsData.overview.totalUsers}
              icon={Users}
              color="text-blue-500"
              trend={{
                value: analyticsData.overview.userGrowth
              }}
            />
            <StatCard
              title={t('totalLessons')}
              value={statsLoading ? '...' : analyticsData.overview.totalLessons}
              icon={BookOpen}
              color="text-green-500"
              trend={{
                value: analyticsData.overview.lessonViews
              }}
            />
            <StatCard
              title={t('totalViews')}
              value={statsLoading ? '...' : analyticsData.overview.totalViews.toLocaleString('vi-VN')}
              icon={Eye}
              color="text-purple-500"
            />
            <StatCard
              title={t('totalTimeSpent')}
              value={formatTimeWithI18n(analyticsData.overview.totalTimeSpent, t)}
              icon={Clock}
              color="text-orange-500"
            />
          </div>

          {}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <MetricCard
              title={t('completionRate')}
              value={`${analyticsData.overview.completionRate}%`}
              icon={Target}
              color="text-blue-600"
              description={t('completionRateDescription')}
              progress={analyticsData.overview.completionRate}
            />
            <MetricCard
              title={t('averageSessionTime')}
              value={formatTimeWithI18n(analyticsData.overview.averageSessionTime, t)}
              icon={Clock}
              color="text-green-600"
              description={t('averageSessionTimeDescription')}
            />
            <MetricCard
              title={t('engagementRate')}
              value={`${analyticsData.overview.engagementRate}%`}
              icon={Activity}
              color="text-purple-600"
              description={t('engagementRateDescription')}
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
              title={t('userSegments')} 
              color="bg-blue-600"
            />
            <DevicePieChart data={analyticsData.deviceStats as any} title={t('deviceUsage')} />
          </div>

          {}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div className="text-sm text-muted-foreground">Chọn ngày để xem hoạt động theo giờ</div>
              <div className="flex items-center gap-2">
                {(() => {
                  const today = new Date().toISOString().slice(0, 10);
                  const clearDate = () => setActivityDate('');
                  return (
                    <>
                      <DatePicker value={activityDate} onChange={setActivityDate} maxDate={today} />
                      <button
                        type="button"
                        className="px-2 py-1 text-sm border rounded hover:bg-muted"
                        onClick={() => setActivityDate(today)}
                      >Hôm nay</button>
                      <button
                        type="button"
                        className="px-2 py-1 text-sm border rounded hover:bg-muted"
                        onClick={clearDate}
                        title="Hiển thị tất cả (không lọc theo ngày)"
                      >Bỏ chọn</button>
                    </>
                  );
                })()}
              </div>
            </div>
            <ActivityHeatmap timeStats={analyticsData.timeStats} />
          </Card>
        </div>
      )}

      {}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('lessonPerformance')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('lesson')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('views')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('completion')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('rating')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('averageTime')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analyticsData.lessonPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        {t('noLessonData')}
                      </td>
                    </tr>
                  ) : (
                    analyticsData.lessonPerformance.map((lesson) => (
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
                                style={{ width: `${Math.min(lesson.completionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground font-medium min-w-[3rem]">{lesson.completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-foreground">{lesson.rating > 0 ? `⭐ ${lesson.rating.toFixed(1)}` : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">-</div>
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

export default function AnalyticsPage() {
  return (
    <SearchParamsProvider>
      <AnalyticsPageContent />
    </SearchParamsProvider>
  );
}
