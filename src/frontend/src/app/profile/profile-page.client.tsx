'use client';

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts'
import { useActiveSessions, useOAuthSessions, useUnlinkProvider } from '@/lib/react-query/hooks/use-oauth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import ProfileOverviewTab from '@/components/profile/ProfileOverviewTab'
import ProfileSessionsTab from '@/components/profile/ProfileSessionsTab'
import { PrivateRoute } from '@/components/auth/PrivateRoute'

export default function ProfilePageClient() {
  const { user, updateProfile, isLoading: isUpdating } = useAuth()
  const { data: activeSessions } = useActiveSessions()
  const { data: oauthSessions } = useOAuthSessions()
  const unlink = useUnlinkProvider()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [tab, setTab] = useState<'overview' | 'sessions'>('overview')

  useEffect(() => {
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    setAvatar(user?.avatar ?? '')
  }, [user?.firstName, user?.lastName, user?.avatar])

  return (
    <PrivateRoute showAccessDenied={false}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
            {avatar ? (
              <Image src={avatar} alt="Avatar" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl font-semibold">
                {(user?.email ?? 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold truncate">{[firstName, lastName].filter(Boolean).join(' ') || user?.email || 'User'}</div>
            {user?.email && <div className="text-muted-foreground truncate">{user.email}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
          <Button variant={tab === 'overview' ? 'default' : 'ghost'} size="sm" className={`rounded-none border-b-2 ${tab === 'overview' ? 'border-foreground' : 'border-transparent'} shrink-0`} onClick={() => setTab('overview')}>Overview</Button>
          <Button variant={tab === 'sessions' ? 'default' : 'ghost'} size="sm" className={`rounded-none border-b-2 ${tab === 'sessions' ? 'border-foreground' : 'border-transparent'} shrink-0`} onClick={() => setTab('sessions')}>Sessions</Button>
        </div>

        {tab === 'overview' && (
          <ProfileOverviewTab
            user={user}
            firstName={firstName}
            lastName={lastName}
            avatar={avatar}
            saving={isUpdating}
            onChangeAvatar={setAvatar}
            onCancel={() => {
              setFirstName(user?.firstName ?? '')
              setLastName(user?.lastName ?? '')
              setAvatar(user?.avatar ?? '')
            }}
            onSave={async (vals) => {
              await updateProfile({ firstName: vals.firstName, lastName: vals.lastName, avatar: vals.avatar })
            }}
          />
        )}

        {tab === 'sessions' && (
          <ProfileSessionsTab
            activeSessions={activeSessions?.sessions}
            oauthSessions={oauthSessions?.sessions}
            onUnlink={(provider) => unlink.mutate(provider)}
          />
        )}
      </div>
    </PrivateRoute>
  )
}
