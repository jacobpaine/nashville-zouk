import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'
import { slugify } from '@/lib/slugify'
import { MOCK_EVENTS } from '@/lib/mock'

const VALID_EVENT_TYPES = ['social', 'workshop', 'class'] as const

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(MOCK_EVENTS)
  }

  try {
    const { db } = await import('@/lib/db')
    const { events } = await import('@/lib/schema')
    const { desc } = await import('drizzle-orm')
    const rows = await db.select().from(events).orderBy(desc(events.startDatetime))
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
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

  if (!VALID_EVENT_TYPES.includes(eventType)) {
    return NextResponse.json({ error: 'Invalid event type.' }, { status: 400 })
  }

  if (isNaN(new Date(startDatetime).getTime())) {
    return NextResponse.json({ error: 'Invalid start datetime.' }, { status: 400 })
  }

  if (endDatetime && isNaN(new Date(endDatetime).getTime())) {
    return NextResponse.json({ error: 'Invalid end datetime.' }, { status: 400 })
  }

  const slug = body.slug?.trim() || slugify(title)

  if (!isDbConfigured()) {
    return NextResponse.json({ id: crypto.randomUUID(), slug, title, message: 'dev-mode: not persisted' })
  }

  try {
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
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
