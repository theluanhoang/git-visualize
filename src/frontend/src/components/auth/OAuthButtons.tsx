'use client';

import { Button } from '@/components/ui/button';
import { useOAuthLogin, useOAuthProviderInfo } from '@/lib/react-query/hooks/use-oauth';
import { OAuthProvider } from '@/services/oauth';
import { Loader2, Github, Facebook } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface OAuthButtonProps {
  provider: OAuthProvider;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function OAuthButton({ 
  provider, 
  isLoading = false, 
  disabled = false,
  className = '',
  children 
}: OAuthButtonProps) {
  const { login } = useOAuthLogin();
  const { getProviderInfo } = useOAuthProviderInfo();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('auth');
  
  const providerInfo = getProviderInfo(provider, t);
  
  const handleClick = () => {
    if (!isLoading && !disabled) {
      login(provider, locale);
    }
  };

  const renderIcon = () => {
    switch (provider) {
      case 'google':
        return <SiGoogle className="h-4 w-4 mr-2" />
      case 'github':
        return <Github className="h-4 w-4 mr-2" />
      case 'facebook':
        return <Facebook className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`w-full justify-center ${providerInfo.color} ${providerInfo.textColor} border-0 hover:opacity-90 transition-opacity ${className}`}
    >
      <span className="inline-flex items-center">
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            renderIcon()
          )}
        </span>
        <span className="ml-2 truncate">{children || `${t('continueWithProvider')} ${providerInfo.name}`}</span>
      </span>
    </Button>
  );
}

interface OAuthButtonsProps {
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
}

export function OAuthButtons({ 
  isLoading = false, 
  disabled = false,
  className = '',
  showLabels = true 
}: OAuthButtonsProps) {
  const providers: OAuthProvider[] = ['google', 'github', 'facebook'];
  const t = useTranslations('auth');

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabels && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('continueWith')}
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {providers.map((provider) => (
          <OAuthButton
            key={provider}
            provider={provider}
            isLoading={isLoading}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
