import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'
import { MOCK_INSTRUCTORS } from '@/lib/mock'

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(MOCK_INSTRUCTORS)
  }

  try {
    const { db } = await import('@/lib/db')
    const { instructors } = await import('@/lib/schema')
    const { asc } = await import('drizzle-orm')
    const rows = await db.select().from(instructors).orderBy(asc(instructors.displayOrder))
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, slug, bio, instagramHandle, displayOrder, isActive } = body

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { id: crypto.randomUUID(), name, slug, bio, instagramHandle, displayOrder: displayOrder ?? 0, isActive: isActive ?? true },
      { status: 201 }
    )
  }

  try {
    const { db } = await import('@/lib/db')
    const { instructors } = await import('@/lib/schema')
    const rows = await db.insert(instructors).values({
      name: name.trim(),
      slug: slug.trim(),
      bio: bio || null,
      instagramHandle: instagramHandle || null,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
    }).returning()
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg?.code === '23505') {
      return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
