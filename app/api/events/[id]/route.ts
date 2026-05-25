import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  if (!isDbConfigured()) {
    return NextResponse.json({ id, ...body, message: 'dev-mode: not persisted' })
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')

  const {
    title, slug, description, startDatetime, endDatetime,
    locationName, locationAddress, locationUrl,
    eventType, isPublished, flyerId,
  } = body

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
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isDbConfigured()) {
    return NextResponse.json({ message: 'dev-mode: not persisted' })
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')
  await db.delete(events).where(eq(events.id, id))
  return NextResponse.json({ success: true })
}
