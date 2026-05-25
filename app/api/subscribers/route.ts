import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json([])
  }

  const { db } = await import('@/lib/db')
  const { subscribers } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt))
  return NextResponse.json(rows)
}
