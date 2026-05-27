import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function POST() {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await import('@/lib/db')
    await db.execute(
      `ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "responsibilities" text`
    )
    return NextResponse.json({ ok: true, message: 'Migration complete.' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
