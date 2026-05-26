import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured } from '@/lib/config'

export async function GET() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    const csv = 'email,first_name,subscribed_at,is_active\n'
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    })
  }

  try {
    const { db } = await import('@/lib/db')
    const { subscribers } = await import('@/lib/schema')
    const { eq, asc } = await import('drizzle-orm')
    const rows = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.isActive, true))
      .orderBy(asc(subscribers.subscribedAt))

    const header = 'email,first_name,subscribed_at\n'
    const lines = rows.map((r) =>
      [
        r.email,
        r.firstName ? `"${r.firstName.replace(/"/g, '""')}"` : '',
        r.subscribedAt.toISOString(),
      ].join(',')
    )
    const csv = header + lines.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
