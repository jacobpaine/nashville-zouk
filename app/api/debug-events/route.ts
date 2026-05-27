import { NextResponse } from 'next/server'
import { isDbConfigured } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbConfigured = isDbConfigured()

  if (!dbConfigured) {
    const { MOCK_EVENTS } = await import('@/lib/mock')
    const now = new Date()
    return NextResponse.json({
      source: 'mock',
      now: now.toISOString(),
      total: MOCK_EVENTS.length,
      upcoming: MOCK_EVENTS.filter((e) => new Date(e.startDatetime) >= now).length,
      events: MOCK_EVENTS.map((e) => ({
        title: e.title,
        start: new Date(e.startDatetime).toISOString(),
        isPublished: e.isPublished,
        future: new Date(e.startDatetime) >= now,
      })),
    })
  }

  try {
    const { db } = await import('@/lib/db')
    const { events } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')
    const rows = await db.select().from(events).where(eq(events.isPublished, true))
    const now = new Date()
    return NextResponse.json({
      source: 'db',
      now: now.toISOString(),
      total: rows.length,
      upcoming: rows.filter((e) => new Date(e.startDatetime) >= now).length,
      events: rows.map((e) => ({
        title: e.title,
        start: new Date(e.startDatetime).toISOString(),
        isPublished: e.isPublished,
        future: new Date(e.startDatetime) >= now,
      })),
    })
  } catch (err) {
    return NextResponse.json({ source: 'db', error: String(err) }, { status: 500 })
  }
}
