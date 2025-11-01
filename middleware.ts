import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only protect admin paths
const adminPaths = ['/admin', '/admin/']

// Check if the current path is an admin path
const isAdminPath = (path: string) => {
  return adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value

  // Only check authentication for admin paths
  if (isAdminPath(pathname)) {
    // If not logged in or not an admin, redirect to unauthorized
    if (!token || userRole !== 'admin') {
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
