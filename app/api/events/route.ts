import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/slugify'
import { MOCK_EVENTS } from '@/lib/mock'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(MOCK_EVENTS)
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  const rows = await db.select().from(events).orderBy(desc(events.startDatetime))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title, description, startDatetime, endDatetime,
    locationName, locationAddress, locationUrl,
    eventType, isPublished, flyerId,
  } = body

  if (!title || !startDatetime || !locationName || !eventType) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const slug = body.slug?.trim() || slugify(title)

  if (!isDbConfigured()) {
    return NextResponse.json({ id: crypto.randomUUID(), slug, title, message: 'dev-mode: not persisted' })
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const rows = await db.insert(events).values({
    title,
    slug,
    description: description || null,
    startDatetime: new Date(startDatetime),
    endDatetime: endDatetime ? new Date(endDatetime) : null,
    locationName,
    locationAddress: locationAddress || null,
    locationUrl: locationUrl || null,
    eventType,
    isPublished: isPublished ?? false,
    flyerId: flyerId || null,
  }).returning()

  return NextResponse.json(rows[0], { status: 201 })
}
