import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { deleteSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ success: true })
    
    // Clear auth cookies
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    })
    
    response.cookies.set({
      name: 'user-role',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    )
  }
}
