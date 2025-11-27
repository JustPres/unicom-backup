import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only protect admin paths
const adminPaths = ['/admin', '/admin/']

// Publicly accessible admin routes (no auth required)
const publicAdminPaths = ['/admin/login']

// Check if the current path is an admin path
const isAdminPath = (path: string) => {
  return adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userRole = request.cookies.get('user-role')?.value

  // Only check authorization for protected admin paths
  if (isAdminPath(pathname) && !publicAdminPaths.includes(pathname)) {
    // If not an admin, redirect to unauthorized
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match admin paths
    '/admin/:path*',
  ],
}
