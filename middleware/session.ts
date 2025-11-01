import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { findSessionByToken, updateSessionActivity } from '@/lib/session'

// List of public paths that don't require authentication
const PUBLIC_PATHS = [
  '/admin/login',
  '/login',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/assets'
]

const isPublicPath = (pathname: string) => {
  return PUBLIC_PATHS.some(publicPath => 
    pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  )
}

export async function validateSession(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value
    
    if (!token) {
      console.log('No session token found')
      return { isValid: false, error: 'No session token' }
    }

    console.log('Validating session token...')
    const session = await findSessionByToken(token)
    
    if (!session) {
      console.log('Invalid or expired session token')
      return { isValid: false, error: 'Invalid session' }
    }

    console.log('Session validated, updating last activity...')
    await updateSessionActivity(token)

    return { 
      isValid: true, 
      userId: session.userId,
      token
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { isValid: false, error: 'Session validation failed' }
  }
}

export async function sessionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths
  if (isPublicPath(pathname) || pathname.includes('.')) {
    console.log(`Skipping middleware for public path: ${pathname}`)
    return NextResponse.next()
  }

  console.log(`Processing request for: ${pathname}`)

  try {
    // Skip session validation for non-admin routes
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
      console.log('Skipping non-admin route')
      return NextResponse.next()
    }

    console.log('Validating session...')
    const { isValid } = await validateSession(request)
    
    if (!isValid) {
      console.log('Invalid session, redirecting to login')
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    console.log('Session is valid, proceeding...')
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // For API routes, return JSON error
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
    
    // For page routes, show error page
    const errorUrl = new URL('/500', request.url)
    return NextResponse.redirect(errorUrl)
  }
}
