'use client';

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import SessionItem from '@/components/profile/SessionItem'
import Pagination from '@/components/common/Pagination'

interface BaseSession {
  id: string
  sessionType?: string
  oauthProvider?: string
  userAgent?: string
  ip?: string
  createdAt: string | Date
  expiresAt: string | Date
}

interface Props {
  activeSessions?: BaseSession[]
  oauthSessions?: BaseSession[]
  onUnlink: (provider: string) => void
}

export default function ProfileSessionsTab({ activeSessions, oauthSessions, onUnlink }: Props) {
  const [activePage, setActivePage] = useState(1)
  const [oauthPage, setOAuthPage] = useState(1)
  const itemsPerPage = 5
  const maxPages = 3

  const activeSessionsData = useMemo(() => {
    if (!activeSessions || activeSessions.length === 0) {
      return []
    }
    
    return activeSessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxPages * itemsPerPage)
  }, [activeSessions])

  const oauthSessionsData = useMemo(() => {
    if (!oauthSessions || oauthSessions.length === 0) {
      return []
    }
    
    return oauthSessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxPages * itemsPerPage)
  }, [oauthSessions])

  const activeTotalPages = Math.ceil(activeSessionsData.length / itemsPerPage)
  const oauthTotalPages = Math.ceil(oauthSessionsData.length / itemsPerPage)

  const activePaginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return activeSessionsData.slice(startIndex, endIndex)
  }, [activeSessionsData, activePage, itemsPerPage])

  const oauthPaginatedData = useMemo(() => {
    const startIndex = (oauthPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return oauthSessionsData.slice(startIndex, endIndex)
  }, [oauthSessionsData, oauthPage, itemsPerPage])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Active Sessions</h2>
              <span className="text-sm text-muted-foreground">
                {activeSessionsData.length} total
              </span>
            </div>
            <div className="space-y-2">
              {activePaginatedData.map((s) => (
                <SessionItem key={s.id} session={s} />
              ))}
              {activeSessionsData.length === 0 && (
                <div className="text-xs text-muted-foreground">No active sessions found.</div>
              )}
            </div>
            {activeTotalPages > 1 && (
              <Pagination
                currentPage={activePage}
                totalPages={activeTotalPages}
                onPageChange={setActivePage}
                itemsPerPage={itemsPerPage}
                totalItems={activeSessionsData.length}
                showInfo={false}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">OAuth Sessions</h2>
              <span className="text-sm text-muted-foreground">
                {oauthSessionsData.length} total
              </span>
            </div>
            <div className="space-y-2">
              {oauthPaginatedData.map((s) => (
                <SessionItem key={s.id} session={s} onUnlink={(provider) => onUnlink(provider)} />
              ))}
              {oauthSessionsData.length === 0 && (
                <div className="text-xs text-muted-foreground">No OAuth sessions found.</div>
              )}
            </div>
            {oauthTotalPages > 1 && (
              <Pagination
                currentPage={oauthPage}
                totalPages={oauthTotalPages}
                onPageChange={setOAuthPage}
                itemsPerPage={itemsPerPage}
                totalItems={oauthSessionsData.length}
                showInfo={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


