import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Remove trailing slash if present (except for root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }
  
  // Normalize URLs - redirect /index to /
  if (url.pathname === '/index' || url.pathname === '/index.html') {
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }
  
  // Ensure consistent domain (if deployed to multiple domains)
  const canonicalHost = 'audiovibes.vercel.app';
  if (request.headers.get('host') !== canonicalHost && 
      process.env.NODE_ENV === 'production') {
    url.host = canonicalHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, robots.txt, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|js)$).*)',
  ],
};
