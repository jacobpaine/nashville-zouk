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
  const { flyers } = await import('@/lib/schema')
  const { eq, ne } = await import('drizzle-orm')

  // If setting as current, clear all others first
  if (body.isCurrent) {
    await db.update(flyers).set({ isCurrent: false }).where(ne(flyers.id, id))
  }

  const rows = await db.update(flyers)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(flyers.id, id))
    .returning()

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
}
