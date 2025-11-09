'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrivateRoute } from './PrivateRoute';
import { useRouteProtection } from './RouteGuard';
import { Shield, Lock, User, Crown } from 'lucide-react';

export default function PrivateRouteDemo() {
  const { canAccess, isLoading, isAuthenticated, user, isAdmin } = usePrivateRoute();
  const routeInfo = useRouteProtection();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🔒 Private Route System Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Kiểm tra trạng thái authentication và route protection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            
            {isAuthenticated && user && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.firstName || user.email || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge 
                    variant={isAdmin ? "default" : "outline"}
                    className={isAdmin ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : ""}
                  >
                    {isAdmin ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        ADMIN
                      </>
                    ) : (
                      "USER"
                    )}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Route Protection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Route Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Route:</span>
              <Badge variant="outline">
                {routeInfo.isPublic ? "Public" : routeInfo.isProtected ? "Protected" : routeInfo.isAdmin ? "Admin" : "Unknown"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requires Auth:</span>
              <Badge variant={routeInfo.requiresAuth ? "destructive" : "secondary"}>
                {routeInfo.requiresAuth ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requires Admin:</span>
              <Badge variant={routeInfo.requiresAdmin ? "destructive" : "secondary"}>
                {routeInfo.requiresAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Can Access:</span>
              <Badge variant={routeInfo.canAccess ? "default" : "destructive"}>
                {routeInfo.canAccess ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Routes */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Different Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600 dark:text-green-400">Public Routes</h4>
              <div className="space-y-1">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/">Home</a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/git-theory">Git Theory</a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/practice">Practice</a>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">Protected Routes</h4>
              <div className="space-y-1">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/profile">Profile</a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/practice/session?practice=test">Practice Session</a>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600 dark:text-purple-400">Admin Routes</h4>
              <div className="space-y-1">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/admin">Admin Dashboard</a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/admin/users">Admin Users</a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/admin/lessons">Admin Lessons</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Private Route System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🔐 Authentication Protection</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Tự động kiểm tra authentication status</li>
                <li>• Auto redirect đến login nếu chưa đăng nhập</li>
                <li>• Loading state trong khi redirect</li>
                <li>• Smooth UX không hiển thị access denied</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">👑 Role-based Access</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Kiểm tra role ADMIN/USER</li>
                <li>• Auto redirect dựa trên role</li>
                <li>• ADMIN → /admin, USER → /</li>
                <li>• Admin-only routes protection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">🛡️ Route Configuration</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Public routes: không cần auth</li>
                <li>• Protected routes: cần auth</li>
                <li>• Admin routes: cần role ADMIN</li>
                <li>• Auto redirect cho auth pages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">⚡ Easy Integration</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• HOC: withPrivateRoute()</li>
                <li>• Hook: usePrivateRoute()</li>
                <li>• Component: PrivateRoute</li>
                <li>• Global: RouteGuard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
