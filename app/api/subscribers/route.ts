import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json([])
  }

  try {
    const { db } = await import('@/lib/db')
    const { subscribers } = await import('@/lib/schema')
    const { desc } = await import('drizzle-orm')
    const rows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt))
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
