export interface RouteConfig {
  public: string[];
  protected: string[];
  admin: string[];
  auth: string[];
}

export const ROUTE_CONFIG: RouteConfig = {
  public: [
    '/',
    '/git-theory',
    '/practice',
    '/celebration-demo',
    '/error-test',
  ],
  
  protected: [
    '/profile',
    '/practice/session',
  ],
  
  admin: [
    '/admin',
  ],
  
  auth: [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
  ],
};

export function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (pathname === route) return true;
    
    if (pathname.startsWith(route + '/')) return true;
    
    return false;
  });
}

export function getRouteType(pathname: string): {
  isPublic: boolean;
  isProtected: boolean;
  isAdmin: boolean;
  isAuth: boolean;
} {
  const normalizedPath = pathname.replace(/^\/(en|vi)/, '') || '/';
  
  const isProtected = matchesRoute(normalizedPath, ROUTE_CONFIG.protected);
  const isAdmin = matchesRoute(normalizedPath, ROUTE_CONFIG.admin);
  const isAuth = matchesRoute(normalizedPath, ROUTE_CONFIG.auth);
  
  const isPublic = !isProtected && !isAdmin && !isAuth && matchesRoute(normalizedPath, ROUTE_CONFIG.public);
  
  return {
    isPublic,
    isProtected,
    isAdmin,
    isAuth,
  };
}

