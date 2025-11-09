'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { tokenUtils } from '@/lib/api/axios'
import { authStorage } from '@/services/auth'
import { useTranslations } from 'next-intl'
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage'

export function SessionExpiredDialog() {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()
  const t = useTranslations('auth.sessionExpired')

  useEffect(() => {
    const handleAuthError = () => {
      setShowDialog(true)
    }

    const stored = authStorage.load()
    if (stored.tokens?.accessToken && stored.tokens?.refreshToken) {
      const isAccessTokenExpired = tokenUtils.isTokenExpired(stored.tokens.accessToken)
      const isRefreshTokenExpired = tokenUtils.isTokenExpired(stored.tokens.refreshToken)
      
      if (isAccessTokenExpired && isRefreshTokenExpired) {
        setShowDialog(true)
      }
    }

    window.addEventListener('auth:session-expired', handleAuthError)
    
    return () => {
      window.removeEventListener('auth:session-expired', handleAuthError)
    }
  }, [])

  const handleConfirm = () => {
    setShowDialog(false)
    
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN)
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.REFRESH_TOKEN)
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.USER)
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.OAUTH_SESSION)
    
    router.replace('/auth/login')
  }

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={handleConfirm}
            className="w-full"
          >
            {t('loginAgain')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
