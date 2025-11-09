'use client';

import React from 'react'
import { Badge } from '@/components/ui/badge'

export function getBadges(userAgent?: string): { label: string; className: string }[] {
  const ua = (userAgent || '').toLowerCase()
  const badges: { label: string; className: string }[] = []
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    badges.push({ label: 'Chrome', className: 'bg-emerald-100 text-emerald-700' })
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    badges.push({ label: 'Safari', className: 'bg-indigo-100 text-indigo-700' })
  } else if (ua.includes('firefox')) {
    badges.push({ label: 'Firefox', className: 'bg-orange-100 text-orange-700' })
  } else if (ua.includes('edg')) {
    badges.push({ label: 'Edge', className: 'bg-blue-100 text-blue-700' })
  } else if (ua) {
    badges.push({ label: 'Browser', className: 'bg-slate-100 text-slate-700' })
  }
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('android') || ua.includes('mobile')) {
    badges.push({ label: 'Mobile', className: 'bg-pink-100 text-pink-700' })
  } else if (ua) {
    badges.push({ label: 'Desktop', className: 'bg-gray-100 text-gray-700' })
  }
  return badges
}

export default function SessionBadges({ userAgent }: { userAgent?: string }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      {getBadges(userAgent).map((b, i) => (
        <Badge key={i} variant="outline" className={`px-1.5 py-0.5 text-[10px] ${b.className}`}>{b.label}</Badge>
      ))}
    </span>
  )
}


