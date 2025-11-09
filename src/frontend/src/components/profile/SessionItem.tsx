'use client';

import React from 'react'
import { Button } from '@/components/ui/button'
import SessionBadges from './SessionBadges'

interface BaseSession {
  id: string
  userAgent?: string
  ip?: string
  createdAt: string | Date
  expiresAt: string | Date
}

interface OAuthSession extends BaseSession {
  oauthProvider?: string
}

interface Props {
  session: BaseSession | OAuthSession
  onUnlink?: (provider: string) => void
}

export default function SessionItem({ session, onUnlink }: Props) {
  const expiresAt = new Date(session.expiresAt)
  const expired = expiresAt <= new Date()
  const provider = (session as OAuthSession).oauthProvider

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm border rounded p-2">
      <div className="min-w-0 flex flex-col gap-2">
        <div className="font-medium flex items-center gap-2">
          <span>{provider ? provider : 'PASSWORD'}</span>
          <SessionBadges userAgent={session.userAgent} />
        </div>
        <div className="text-muted-foreground truncate">{session.userAgent ?? 'Unknown device'} · {session.ip ?? 'Unknown IP'}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-muted-foreground">
          {expired ? 'Expired: ' : 'Expires: '}
          {expiresAt.toLocaleString()}
        </div>
        {provider && !expired && onUnlink && (
          <Button variant="destructive" size="sm" onClick={() => onUnlink(provider.toLowerCase())}>Unlink</Button>
        )}
      </div>
    </div>
  )
}


