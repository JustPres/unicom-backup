import { getDb } from "./db"

export interface Session {
  userId: string
  token: string
  ipAddress: string
  userAgent: string
  lastActivity: Date
  createdAt: Date
}

export async function createSession(session: Omit<Session, 'createdAt'>) {
  const db = await getDb()
  const result = await db.collection('sessions').insertOne({
    ...session,
    createdAt: new Date()
  })
  return result.insertedId
}

export async function findSessionByToken(token: string): Promise<Session | null> {
  const db = await getDb()
  return await db.collection<Session>('sessions').findOne({ token })
}

export async function deleteSession(token: string) {
  const db = await getDb()
  await db.collection('sessions').deleteOne({ token })
}

export async function deleteAllUserSessions(userId: string) {
  const db = await getDb()
  await db.collection('sessions').deleteMany({ userId })
}

export async function updateSessionActivity(token: string) {
  const db = await getDb()
  await db.collection('sessions').updateOne(
    { token },
    { $set: { lastActivity: new Date() } }
  )
}
