import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

const MOCK_CONTENT = `## Welcome to Nashville Zouk

Brazilian Zouk is a partner dance that originated in Brazil, characterized by its fluid movements, connection between partners, and musicality.

Nashville Zouk brings this beautiful dance to Music City. We host regular social dances, workshops, and classes for all levels — from complete beginners to experienced dancers.

Whether you're brand new to partner dancing or looking to expand your repertoire, you're welcome here.`

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ content: MOCK_CONTENT })
  }

  try {
    const { db } = await import('@/lib/db')
    const { aboutContent } = await import('@/lib/schema')
    const rows = await db.select().from(aboutContent).limit(1)
    return NextResponse.json({ content: rows[0]?.content ?? '' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ content })
  }

  try {
    const { db } = await import('@/lib/db')
    const { aboutContent } = await import('@/lib/schema')
    const rows = await db.select().from(aboutContent).limit(1)

    if (rows[0]) {
      await db.update(aboutContent).set({ content, updatedAt: new Date() })
    } else {
      await db.insert(aboutContent).values({ content })
    }

    return NextResponse.json({ content })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
