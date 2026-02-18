import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const refreshToken = request.cookies.get('refreshToken')?.value
  const hasValidToken = !!refreshToken

  const publicPaths = ['/login']
  const isPublicPath = publicPaths.includes(pathname)

  const protectedPaths = [
    '/dashboard',
    '/users',
    '/permissions',
    '/roles',
    '/advertisements',
  ]

  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isPublicPath && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedPath && !hasValidToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/users/:path*',
    '/permissions/:path*',
    '/roles/:path*',
    '/advertisements/:path*',
    '/dashboard/:path*',
    '/login',
  ]
}
