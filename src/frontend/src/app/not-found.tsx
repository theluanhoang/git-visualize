'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, GitBranch, ExternalLink } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px] opacity-30"></div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-10">

          {/* Content Section */}
          <div className="space-y-6">
            {/* Error Code */}
            <div className="space-y-2">
              <h1 className="text-8xl md:text-9xl font-bold text-gray-900 dark:text-white tracking-tight">
                4<span className="text-blue-600 dark:text-blue-400">0</span>4
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">Page not found</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                Sorry, we couldn't find the page you're looking for. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Link 
                href="/" 
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Home className="w-4 h-4" />
                Go Home
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                href="/git-theory" 
                className="group inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                <GitBranch className="w-4 h-4" />
                Git Theory
              </Link>
              
              <button 
                onClick={() => window.history.back()} 
                className="group inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>

          {/* Helpful Links - Minimalist */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                href="/git-theory" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                Git Theory
              </Link>
            </div>
          </div>

          {/* Subtle Footer Info */}
          <div className="pt-8">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Need help? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}