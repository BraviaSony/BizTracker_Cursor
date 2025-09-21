import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard and other app routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || 
      req.nextUrl.pathname.startsWith('/expenses') ||
      req.nextUrl.pathname.startsWith('/liabilities') ||
      req.nextUrl.pathname.startsWith('/salaries') ||
      req.nextUrl.pathname.startsWith('/cashflow') ||
      req.nextUrl.pathname.startsWith('/pdc') ||
      req.nextUrl.pathname.startsWith('/capital') ||
      req.nextUrl.pathname.startsWith('/settings')) {
    
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
