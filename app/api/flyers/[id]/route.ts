import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Explicit allowlist — never spread the full request body into a DB update
  const { eventId, title } = body as {
    eventId?: string | null
    title?: string
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ id, eventId, title, message: 'dev-mode: not persisted' })
  }

  try {
    const { db } = await import('@/lib/db')
    const { flyers } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.update(flyers)
      .set({
        eventId: 'eventId' in body ? (eventId ?? null) : undefined,
        title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(flyers.id, id))
      .returning()

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
    const { flyers } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(flyers).where(eq(flyers.id, id)).limit(1)
    const flyer = rows[0]
    if (!flyer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (flyer.imageKey) {
      const { deleteFile } = await import('@/lib/storage')
      await deleteFile(flyer.imageKey).catch(console.error)
    }

    await db.delete(flyers).where(eq(flyers.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
