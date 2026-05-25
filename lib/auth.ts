import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  adminId: string
  email: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'admin-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.adminId) {
    throw new Error('Unauthorized')
  }
  return session
}
