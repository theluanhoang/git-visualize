import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getRouteType } from './lib/middleware/routes';
import { isAuthenticated, isAdmin, getUserFromCookies } from './lib/middleware/auth';
import { createLocalizedRedirect, addRedirectParam } from './lib/middleware/utils';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return intlMiddleware(request);
  }
  
  const routeType = getRouteType(pathname);
  
  if (routeType.isPublic) {
    return intlMiddleware(request);
  }
  
  const authenticated = isAuthenticated(request);
  const user = getUserFromCookies(request);
  const userIsAdmin = isAdmin(user);
  
  const intlResponse = intlMiddleware(request);
  
  if (routeType.isAuth) {
    if (authenticated) {
      const homeUrl = createLocalizedRedirect(request, '/');
      return NextResponse.redirect(homeUrl);
    }
    return intlResponse;
  }
  
  if (routeType.isAdmin) {
    if (!authenticated) {
      const loginUrl = createLocalizedRedirect(request, '/auth/login');
      addRedirectParam(loginUrl, pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (!userIsAdmin) {
      const homeUrl = createLocalizedRedirect(request, '/');
      return NextResponse.redirect(homeUrl);
    }
    
    return intlResponse;
  }
  
  if (routeType.isProtected) {
    if (!authenticated) {
      const loginUrl = createLocalizedRedirect(request, '/auth/login');
      addRedirectParam(loginUrl, pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return intlResponse;
  }
  
  return intlResponse;
}

export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
