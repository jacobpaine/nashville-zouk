import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const { db } = await import('@/lib/db')
    const { instructors } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')
    const rows = await db.select().from(instructors).where(eq(instructors.id, id)).limit(1)
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, slug, bio, instagramHandle, displayOrder, isActive } = body

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ id, name, slug, bio, instagramHandle, displayOrder, isActive })
  }

  try {
    const { db } = await import('@/lib/db')
    const { instructors } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')
    const rows = await db
      .update(instructors)
      .set({
        name: name.trim(),
        slug: slug.trim(),
        bio: bio || null,
        instagramHandle: instagramHandle || null,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(instructors.id, id))
      .returning()
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg?.code === '23505') {
      return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isDbConfigured()) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const { db } = await import('@/lib/db')
    const { instructors } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(instructors).where(eq(instructors.id, id)).limit(1)
    const instructor = rows[0]
    if (!instructor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (instructor.photoKey) {
      const { deleteFile } = await import('@/lib/storage')
      await deleteFile(instructor.photoKey).catch(() => null)
    }

    await db.delete(instructors).where(eq(instructors.id, id))
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
