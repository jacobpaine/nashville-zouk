import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json([])
  }

  const { db } = await import('@/lib/db')
  const { campaigns } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  const rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { subject, bodyText } = body

  if (!subject?.trim() || !bodyText?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required.' }, { status: 400 })
  }

  const { marked } = await import('marked')
  const bodyHtml = await marked.parse(bodyText)

  if (!isDbConfigured()) {
    return NextResponse.json(
      { id: crypto.randomUUID(), subject, bodyHtml, bodyText, status: 'draft' },
      { status: 201 }
    )
  }

  const { db } = await import('@/lib/db')
  const { campaigns } = await import('@/lib/schema')
  const rows = await db
    .insert(campaigns)
    .values({ subject: subject.trim(), bodyHtml, bodyText: bodyText.trim() })
    .returning()
  return NextResponse.json(rows[0], { status: 201 })
}
