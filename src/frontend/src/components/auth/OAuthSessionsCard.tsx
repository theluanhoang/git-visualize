'use client';

import { useState } from 'react';
import { useOAuthSessions, useUnlinkProvider } from '@/lib/react-query/hooks/use-oauth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Shield, Monitor, Smartphone, Tablet } from 'lucide-react';

export function OAuthSessionsCard() {
  const { data: sessionsData, isLoading, error } = useOAuthSessions();
  const { mutate: unlinkProvider, isPending: isUnlinking } = useUnlinkProvider();
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const handleUnlink = async (provider: string, sessionId: string) => {
    setUnlinkingId(sessionId);
    try {
      await unlinkProvider(provider);
    } catch (error) {
      console.error('Failed to unlink provider:', error);
    } finally {
      setUnlinkingId(null);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'GOOGLE':
        return 'bg-red-500 text-white';
      case 'GITHUB':
        return 'bg-gray-800 text-white';
      case 'FACEBOOK':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            OAuth Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            OAuth Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load OAuth sessions. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const sessions = sessionsData?.sessions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          OAuth Sessions ({sessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No OAuth sessions found</p>
            <p className="text-sm">You haven't logged in with any OAuth providers yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.userAgent)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={getProviderColor(session.oauthProvider)}>
                        {session.oauthProvider}
                      </Badge>
                      {session.isActive && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connected on {formatDate(session.createdAt)}
                    </p>
                    {session.userAgent && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.userAgent.split(' ')[0]} • {session.ip || 'Unknown IP'}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlink(session.oauthProvider || '', session.id)}
                  disabled={isUnlinking && unlinkingId === session.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isUnlinking && unlinkingId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
