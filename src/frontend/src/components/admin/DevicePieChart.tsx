"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const BASE_PALETTE = [
  'rgb(59, 130, 246)',  
  'rgb(16, 185, 129)', 
  'rgb(245, 158, 11)',  
  'rgb(168, 85, 247)',  
  'rgb(236, 72, 153)',  
  'rgb(6, 182, 212)',   
  'rgb(234, 88, 12)',   
  'rgb(99, 102, 241)',  
  'rgb(139, 92, 246)', 
  'rgb(34, 197, 94)'  
];

type DeviceDatum = { device: string; count: number };

export function DevicePieChart({ data, title = 'Thiết bị sử dụng' }: { data: DeviceDatum[]; title?: string }) {
  const { theme, resolvedTheme } = useTheme();
  const [colors, setColors] = useState({
    text: '#6b7280',
    border: 'rgba(107,114,128,0.25)',
    legend: '#6b7280',
    slices: BASE_PALETTE
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const get = (v: string) => root.style.getPropertyValue(v) || getComputedStyle(root).getPropertyValue(v);
    const parse = (raw: string) => raw.trim().split(/\s+/);
    const toRgb = (raw: string, alpha?: number) => {
      const [h, sPct, lPct] = parse(raw);
      const hNum = parseFloat(h); const s = parseFloat(sPct) / 100; const l = parseFloat(lPct) / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s; const hp = hNum / 60; const x = c * (1 - Math.abs((hp % 2) - 1));
      let r1=0,g1=0,b1=0; if (hp>=0&&hp<1){r1=c;g1=x;} else if(hp<2){r1=x;g1=c;} else if(hp<3){g1=c;b1=x;} else if(hp<4){g1=x;b1=c;} else if(hp<5){r1=x;b1=c;} else {r1=c;b1=x;}
      const m = l - c/2; const r=Math.round((r1+m)*255), g=Math.round((g1+m)*255), b=Math.round((b1+m)*255);
      return alpha!=null ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
    };
    const textHsl = get('--muted-foreground') || get('--foreground');
    const borderHsl = get('--border') || textHsl;
    setColors({
      text: textHsl ? toRgb(textHsl) : '#6b7280',
      border: borderHsl ? toRgb(borderHsl, 0.3) : 'rgba(107,114,128,0.25)',
      legend: textHsl ? toRgb(textHsl) : '#6b7280',
      slices: BASE_PALETTE
    });
  }, [theme, resolvedTheme]);

  const chartData = useMemo(() => {
    const labels = data.map(d => d.device);
    const counts = data.map(d => Number(d.count) || 0);
    const sliceColors = colors.slices.slice(0, Math.max(labels.length, 1));
    const toAlpha = (rgb: string, alpha: number) => {
      const m = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (!m) return rgb;
      const r = Number(m[1]); const g = Number(m[2]); const b = Number(m[3]);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const bgColors = sliceColors.map(c => toAlpha(c, 0.65));
    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: bgColors,
          borderColor: sliceColors,
          borderWidth: 2,
          hoverBackgroundColor: sliceColors.map(c => toAlpha(c, 0.85)),
          hoverBorderColor: sliceColors,
          hoverOffset: 8
        }
      ]
    };
  }, [data, colors]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', borderColor: colors.border, borderWidth: 1, callbacks: { label: (ctx: any) => {
        const value = ctx.parsed; const total = ctx.dataset.data.reduce((s: number, v: number) => s + v, 0) || 1;
        const pct = Math.round((value * 1000) / total) / 10;
        return `${ctx.label}: ${value.toLocaleString('vi-VN')} (${pct}%)`;
      } } }
    },
    cutout: '60%'
  }), [colors]);

  const customLegend = useMemo(() => {
    const labels = chartData.labels as string[];
    const counts = ((chartData.datasets?.[0]?.data as number[]) || []).map(v => Number(v) || 0);
    const total = counts.reduce((s, v) => s + v, 0) || 1;
    const sliceColors = colors.slices.slice(0, Math.max(labels.length, 1));
    return labels.map((label, idx) => {
      const count = counts[idx] || 0;
      const pct = Math.round((count * 1000) / total) / 10;
      const color = sliceColors[idx % sliceColors.length];
      return { label, count, pct, color };
    });
  }, [chartData, colors]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {(() => {
        const total = ((chartData.datasets?.[0]?.data as number[]) || []).reduce((s, v) => s + (v || 0), 0);
        if (!total) {
          return (
            <div className="h-40 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Không có dữ liệu thiết bị để hiển thị</div>
            </div>
          );
        }
        return (
          <>
            <div className="h-64">
              <Doughnut data={chartData} options={options} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {customLegend.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="inline-block rounded-full border" style={{ backgroundColor: item.color, width: 10, height: 10, borderColor: colors.border }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.pct}% • {item.count.toLocaleString('vi-VN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </Card>
  );
}


