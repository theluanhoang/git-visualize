'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/react-query/query-keys';
import { toast } from 'sonner';
import { authStorage } from '@/services/auth';
import { api } from '@/lib/api/axios';
import { authApi } from '@/services/auth';
import CodeImageBackground from '@/components/common/CodeImageBackground';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchParamsProvider } from '@/components/common';

function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const queryClient = useQueryClient();
  const t = useTranslations('auth');
  const locale = (params.locale as string) || 'en';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('processingOAuth') || 'Processing OAuth login...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const isNewUser = searchParams.get('is_new_user') === 'true';
        const error = searchParams.get('error');

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!accessToken || !refreshToken) {
          throw new Error(t('missingTokens') || 'Missing authentication tokens');
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        const userInfo = await authApi.getCurrentUser();

        authStorage.save(
          { accessToken, refreshToken },
          userInfo
        );

        queryClient.setQueryData(authKeys.user(), userInfo);

        setStatus('success');
        setMessage(isNewUser ? t('accountCreated') || 'Account created successfully! Welcome!' : t('loginSuccessful') || 'Login successful!');
        
        if (userInfo.role === 'ADMIN') {
          router.replace(`/${locale}/admin`);
        } else {
          router.replace(`/${locale}`);
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : t('authFailed') || 'Authentication failed');
        router.push(`/${locale}/auth/login`);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, queryClient, locale, t]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950/20';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <CodeImageBackground />
      
      <Card className={`w-full max-w-md ${getStatusColor()} shadow-lg border-[var(--border)]`}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {status === 'loading' && (t('processing') || 'Processing...')}
                {status === 'success' && (t('success') || 'Success!')}
                {status === 'error' && (t('error') || 'Error')}
              </h1>
              
              <p className="text-muted-foreground">
                {message}
              </p>
            </div>

            {status === 'loading' && (
              <div className="text-sm text-muted-foreground">
                {t('pleaseWait') || 'Please wait while we complete your authentication...'}
              </div>
            )}

            {status === 'success' && null}

            {status === 'error' && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {t('redirectingToLogin') || 'Redirecting you to the login page...'}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/${locale}/auth/login`)}
                  className="w-full"
                >
                  {t('goToLogin') || 'Go to Login'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <SearchParamsProvider 
      fallback={<div className="min-h-screen flex items-center justify-center p-8">Loading...</div>}
    >
      <OAuthCallbackPage />
    </SearchParamsProvider>
  );
}
