"use client";
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line as LineChartJS, Bar as BarChartJS } from 'react-chartjs-2';
import { parseCssHslTriplet, hslTripletToRgbString, hslTripletToRgbaString } from '@/lib/color-utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTooltip, Legend);

interface TimeStatProps {
  hour: string;
  users: number;
}

export function TimeStatItem({ hour, users, maxUsers, maxBarHeight }: { hour: string; users: number; maxUsers: number; maxBarHeight: number }) {
  const height = Math.max((users / Math.max(1, maxUsers)) * maxBarHeight, 4);
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{hour}</div>
      <div 
        className="bg-blue-100 rounded-sm flex items-end justify-center"
        style={{ height: `${height}px` }}
        title={`${hour} • ${users.toLocaleString('vi-VN')} hoạt động`}
      >
        <div className="bg-blue-600 w-full rounded-sm" />
      </div>
      <div className="text-xs text-gray-600 mt-1">{users.toLocaleString('vi-VN')}</div>
    </div>
  );
}

export function ActivityHeatmap({ timeStats }: { timeStats: TimeStatProps[] }) {
  const [view, setView] = useState<'bar' | 'line'>('bar');
  const [open, setOpen] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [themeColors, setThemeColors] = useState({
    primary: '#3b82f6',
    primaryAlpha: 'rgba(59,130,246,0.25)',
    text: '#6b7280',
    grid: 'rgba(107,114,128,0.25)',
    tooltipBg: '#0b0b0b',
    tooltipText: '#fafafa',
    tooltipBorder: 'rgba(107,114,128,0.35)'
  });

  

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const getHsl = (name: string) => root.style.getPropertyValue(name) || getComputedStyle(root).getPropertyValue(name);
    const primaryRaw = getHsl('--primary');
    const fgRaw = getHsl('--muted-foreground') || getHsl('--foreground');
    const borderRaw = getHsl('--border') || fgRaw;
    const popoverBgRaw = getHsl('--popover');
    const popoverFgRaw = getHsl('--popover-foreground') || fgRaw;

    const primaryTuple = primaryRaw ? parseCssHslTriplet(primaryRaw) : null;
    const textTuple = fgRaw ? parseCssHslTriplet(fgRaw) : null;
    const borderTuple = borderRaw ? parseCssHslTriplet(borderRaw) : null;
    const popBgTuple = popoverBgRaw ? parseCssHslTriplet(popoverBgRaw) : null;
    const popFgTuple = popoverFgRaw ? parseCssHslTriplet(popoverFgRaw) : null;
    setThemeColors({
      primary: primaryTuple ? hslTripletToRgbString(primaryTuple) : '#3b82f6',
      primaryAlpha: primaryTuple ? hslTripletToRgbaString(primaryTuple, 0.25) : 'rgba(59,130,246,0.25)',
      text: textTuple ? hslTripletToRgbString(textTuple) : '#6b7280',
      grid: borderTuple ? hslTripletToRgbaString(borderTuple, 0.3) : 'rgba(107,114,128,0.25)',
      tooltipBg: popBgTuple ? hslTripletToRgbString(popBgTuple) : '#0b0b0b',
      tooltipText: popFgTuple ? hslTripletToRgbString(popFgTuple) : '#fafafa',
      tooltipBorder: borderTuple ? hslTripletToRgbaString(borderTuple, 0.35) : 'rgba(107,114,128,0.35)'
    });
  }, [theme, resolvedTheme]);

  const chartData = useMemo(() => ({
    labels: timeStats.map(t => t.hour),
    datasets: [
      {
        label: 'Hoạt động',
        data: timeStats.map(t => t.users),
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primaryAlpha,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }), [timeStats, themeColors]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        callbacks: { label: (ctx: any) => Number(ctx.parsed.y).toLocaleString('vi-VN') },
        backgroundColor: themeColors.tooltipBg,
        titleColor: themeColors.tooltipText,
        bodyColor: themeColors.tooltipText,
        borderColor: themeColors.tooltipBorder,
        borderWidth: 1
      }
    },
    scales: { 
      x: { ticks: { color: themeColors.text, maxRotation: 0 }, grid: { color: themeColors.grid } },
      y: { ticks: { precision: 0, color: themeColors.text }, grid: { color: themeColors.grid } }
    }
  }), [themeColors]);

  const barOptions = lineOptions;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Hoạt động theo giờ</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${view === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
              onClick={() => setView('bar')}
            >Cột</button>
            <button
              className={`px-3 py-1 text-sm border-l ${view === 'line' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
              onClick={() => setView('line')}
            >Đường</button>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Xem chi tiết</Button>
        </div>
      </div>
      {view === 'bar' ? (
        <div className="w-full h-48">
          <BarChartJS data={chartData} options={barOptions} />
        </div>
      ) : (
        <div className="w-full h-48">
          <LineChartJS data={chartData} options={lineOptions} />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hoạt động theo giờ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Tổng số hoạt động trong ngày</div>
              <div className="text-sm font-medium text-foreground">
                {timeStats.reduce((s, t) => s + (t.users || 0), 0).toLocaleString('vi-VN')}
              </div>
            </div>
            <div className="rounded-md border">
              <div className="max-h-80 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <tr className="text-muted-foreground">
                      <th className="px-4 py-2 text-left uppercase tracking-wider font-medium">Giờ</th>
                      <th className="px-4 py-2 text-right uppercase tracking-wider font-medium">Hoạt động</th>
                      <th className="px-4 py-2 text-left uppercase tracking-wider font-medium w-40">Biểu diễn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeStats.map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-4 py-2 text-foreground whitespace-nowrap">{t.hour}</td>
                        <td className="px-4 py-2 text-foreground text-right whitespace-nowrap">{t.users.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-2">
                          <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
                            <div
                              className="h-2 rounded-sm"
                              style={{
                                width: `${Math.max(2, (t.users / Math.max(1, Math.max(...timeStats.map(x => x.users || 0)))) * 100)}%`,
                                backgroundColor: themeColors.primary
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>Đỉnh điểm: {(() => {
                const max = Math.max(...timeStats.map(t => t.users || 0));
                const idx = timeStats.findIndex(t => t.users === max);
                if (max <= 0 || idx < 0) return '—';
                return `${timeStats[idx].hour} (${max.toLocaleString('vi-VN')})`;
              })()}</div>
              <div>
                Trung bình/giờ: {(() => {
                  const sum = timeStats.reduce((s, t) => s + (t.users || 0), 0);
                  const avg = sum / Math.max(1, timeStats.length);
                  return Math.round(avg).toLocaleString('vi-VN');
                })()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
