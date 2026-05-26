import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isDbConfigured, isEmailConfigured } from '@/lib/config'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { testEmail } = body

  if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
    return NextResponse.json({ error: 'Valid email address required.' }, { status: 400 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: 'Email (Resend) not configured.' }, { status: 503 })
  }

  try {
    const { db } = await import('@/lib/db')
    const { campaigns } = await import('@/lib/schema')
    const { eq } = await import('drizzle-orm')

    const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
    const campaign = rows[0]
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nashvillezouk.com'
    const testHtml = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">Nashville Zouk</p>
  <p style="font-size: 12px; color: #6b7280; background: #f9fafb; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px;">
    ⚠️ TEST EMAIL — not sent to subscribers
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p>Hi [test recipient],</p>
  ${campaign.bodyHtml}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">
    You're receiving this because you signed up at nashvillezouk.com.<br />
    <a href="${appUrl}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>`

    const { sendEmail } = await import('@/lib/email')
    await sendEmail({
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: testHtml,
      text: `[TEST EMAIL]\n\n${campaign.bodyText}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send test email.' }, { status: 500 })
  }
}
