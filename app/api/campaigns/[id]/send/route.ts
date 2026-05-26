import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured, isEmailConfigured } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: 'Email (Resend) not configured.' }, { status: 503 })
  }

  const { db } = await import('@/lib/db')
  const { campaigns, subscribers } = await import('@/lib/schema')
  const { eq, and } = await import('drizzle-orm')

  let campaign
  let recipientRows
  try {
    // Atomic lock: marks the campaign sent before sending to prevent double-send on concurrent requests
    const locked = await db
      .update(campaigns)
      .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      .where(and(eq(campaigns.id, id), eq(campaigns.status, 'draft')))
      .returning()

    if (locked.length === 0) {
      const check = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(eq(campaigns.id, id))
        .limit(1)
      if (!check[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ error: 'Campaign already sent.' }, { status: 409 })
    }

    campaign = locked[0]
    recipientRows = await db.select().from(subscribers).where(eq(subscribers.isActive, true))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }

  if (recipientRows.length === 0) {
    return NextResponse.json({ error: 'No active subscribers.' }, { status: 400 })
  }

  const wrappedHtml = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">Nashville Zouk</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p>Hi {{firstName}},</p>
  ${campaign.bodyHtml}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">
    You're receiving this because you signed up at nashvillezouk.com.<br />
    <a href="{{unsubscribeLink}}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>`

  const wrappedText = `Hi {{firstName}},\n\n${campaign.bodyText}\n\n---\nYou're receiving this because you signed up at nashvillezouk.com.\nUnsubscribe: {{unsubscribeLink}}`

  const { sendBatch } = await import('@/lib/email')
  const { sentCount } = await sendBatch(
    recipientRows.map((r) => ({
      email: r.email,
      firstName: r.firstName,
      unsubscribeToken: r.unsubscribeToken,
    })),
    { subject: campaign.subject, html: wrappedHtml, text: wrappedText }
  )

  try {
    const final = await db
      .update(campaigns)
      .set({ recipientCount: sentCount })
      .where(eq(campaigns.id, id))
      .returning()
    return NextResponse.json(final[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }
}
