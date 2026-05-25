'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/auth'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

export type LoginState = { error?: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  let adminId: string
  let adminEmail: string

  if (!isDbConfigured()) {
    const devEmail = (process.env.ADMIN_EMAIL ?? 'admin@nashvillezouk.com').toLowerCase()
    const devPassword = process.env.ADMIN_PASSWORD ?? 'admin'
    if (email !== devEmail || password !== devPassword) {
      return { error: 'Invalid credentials.' }
    }
    adminId = 'dev-admin'
    adminEmail = devEmail
  } else {
    const bcrypt = await import('bcryptjs')
    const { db } = await import('@/lib/db')
    const { adminUsers } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
    const admin = rows[0]
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return { error: 'Invalid credentials.' }
    }
    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, admin.id))
    adminId = admin.id
    adminEmail = admin.email
  }

  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  session.adminId = adminId
  session.email = adminEmail
  await session.save()

  redirect('/admin/events')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  session.destroy()
  redirect('/admin/login')
}
