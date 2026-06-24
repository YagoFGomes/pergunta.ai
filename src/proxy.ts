import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function hasAuthToken(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('pergunta_access_token')?.value ||
    request.cookies.get('pergunta_refresh_token')?.value
  );
}

export default function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!hasAuthToken(request)) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
