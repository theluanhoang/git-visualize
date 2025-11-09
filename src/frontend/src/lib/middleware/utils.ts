import { NextRequest } from 'next/server';

export function getLocaleFromPath(pathname: string): string {
  const localeMatch = pathname.match(/^\/(en|vi)/);
  return localeMatch ? localeMatch[1] : 'en';
}

export function createLocalizedRedirect(
  request: NextRequest,
  path: string,
  locale?: string
): URL {
  const currentLocale = locale || getLocaleFromPath(request.nextUrl.pathname);
  const redirectUrl = new URL(`/${currentLocale}${path}`, request.url);
  
  if (request.nextUrl.search) {
    redirectUrl.search = request.nextUrl.search;
  }
  
  return redirectUrl;
}

export function addRedirectParam(url: URL, redirectPath: string): void {
  url.searchParams.set('redirect', redirectPath);
}

