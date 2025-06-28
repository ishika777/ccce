import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isCodeRoute = pathname.includes('code');

  if (isDashboard && isCodeRoute) {
    auth.protect(); // Enforce auth only if it's dashboard and not a "code" route
  }

  return NextResponse.next(); // Allow all others
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}