import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = await getDb()
    const users = await db.collection('users')
      .find({ role: 'admin' })
      .project({ _id: 0, id: 1, name: 1, email: 1 })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}
