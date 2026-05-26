import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

const VALID_EVENT_TYPES = ['social', 'workshop', 'class'] as const

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const {
    title, slug, description, startDatetime, endDatetime,
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

  if (!isDbConfigured()) {
    return NextResponse.json({ id, ...body, message: 'dev-mode: not persisted' })
  }

  try {
    const { db } = await import('@/lib/db')
    const { events } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.update(events).set({
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
      updatedAt: new Date(),
    }).where(eq(events.id, id)).returning()

    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isDbConfigured()) {
    return NextResponse.json({ message: 'dev-mode: not persisted' })
  }

  try {
    const { db } = await import('@/lib/db')
    const { events } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')
    await db.delete(events).where(eq(events.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
