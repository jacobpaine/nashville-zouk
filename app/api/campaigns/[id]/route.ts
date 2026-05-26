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
    const { campaigns } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')
    const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
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
  const { subject, bodyText } = body

  if (!subject?.trim() || !bodyText?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required.' }, { status: 400 })
  }

  if (!isDbConfigured()) {
    const { marked } = await import('marked')
    const bodyHtml = await marked.parse(bodyText)
    return NextResponse.json({ id, subject, bodyHtml, bodyText, status: 'draft' })
  }

  try {
    const { db } = await import('@/lib/db')
    const { campaigns } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
    const campaign = rows[0]
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Cannot edit a sent campaign.' }, { status: 409 })
    }

    const { marked } = await import('marked')
    const bodyHtml = await marked.parse(bodyText)

    const updated = await db
      .update(campaigns)
      .set({ subject: subject.trim(), bodyHtml, bodyText: bodyText.trim(), updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning()
    return NextResponse.json(updated[0])
  } catch (err) {
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
    const { campaigns } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
    const campaign = rows[0]
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Cannot delete a sent campaign.' }, { status: 409 })
    }

    await db.delete(campaigns).where(eq(campaigns.id, id))
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
