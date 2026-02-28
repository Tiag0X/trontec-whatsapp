
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('auth')
    const { pathname } = request.nextUrl

    // Allow public paths
    if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api/auth/login')) {
        return NextResponse.next()
    }

    // Check auth
    if (!authCookie || authCookie.value !== 'true') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (API routes for auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
}
