'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, Search, ArrowLeft, GitBranch, ImageOff } from 'lucide-react';

export default function LocaleNotFoundPage() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-40 h-40 mx-auto mb-8 rounded-2xl bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm flex items-center justify-center">
              <ImageOff className="w-10 h-10 text-blue-500" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                4<span className="text-blue-600 dark:text-blue-400">0</span>4
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                {t('pageNotFound')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The page you're looking for seems to have wandered off into the digital void. 
                Don't worry, even the best developers get lost sometimes!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              {t('home')}
            </Link>
            <Link 
              href="/practice" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <GitBranch className="w-5 h-5" />
              {t('practice')}
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('back')}
            </button>
          </div>

          {/* Helpful Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">{t('home')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Start your journey</div>
                </div>
              </Link>
              <Link 
                href="/practice" 
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <GitBranch className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">{t('practice')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Learn Git hands-on</div>
                </div>
              </Link>
              <Link 
                href="/search" 
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Search</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Find what you need</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Fun Fact:</strong> The 404 error got its name from room 404 at CERN, 
              where the original web servers were located. The room was used to store the 
              World Wide Web's central database, and when it was moved, broken links 
              returned a "404: File Not Found" error!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}