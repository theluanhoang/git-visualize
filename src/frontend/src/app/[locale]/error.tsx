'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RefreshCw, Home, Bug, AlertTriangle, ArrowLeft, ImageOff } from 'lucide-react';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-40 h-40 mx-auto mb-8 rounded-2xl bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm flex items-center justify-center">
              <ImageOff className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                  Oops!
                </h1>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                {t('error')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We encountered an unexpected error. Don't worry, our team has been notified 
                and we're working to fix it. In the meantime, you can try refreshing the page.
              </p>
            </div>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error Details (Development Only)
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              {t('tryAgain')}
            </button>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              {t('home')}
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('back')}
            </button>
          </div>

          {/* Helpful Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              What can you do?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Refresh the page</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sometimes a simple refresh can resolve temporary issues
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Go to homepage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start fresh from our main page
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bug className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Report the issue</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us improve by reporting this error
                </p>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="mt-12 p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-300 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Technical Note:</strong> If this error persists, please check your internet 
              connection and try again. If the problem continues, our development team has been 
              automatically notified and will investigate the issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}