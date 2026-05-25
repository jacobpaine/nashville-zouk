'use server'

import { randomUUID } from 'crypto'

export type SubscribeState = {
  success: boolean
  error?: string
}

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'

function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY
  return !!key && !key.startsWith('re_your_api_key')
}

async function sendConfirmationEmail(
  email: string,
  firstName: string | null,
  unsubscribeToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nashvillezouk.com'
  const unsubscribeLink = `${appUrl}/unsubscribe?token=${unsubscribeToken}`
  const greeting = firstName ? `Hi ${firstName}` : 'Hey there'

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #111827;">
  <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">Nashville Zouk</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p>${greeting},</p>
  <p>You're in! We'll keep you posted on upcoming socials, workshops, and events.</p>
  <p>See you on the dance floor 🎶</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">
    You received this because you signed up at nashvillezouk.com.<br />
    <a href="${unsubscribeLink}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>`

  const text = `${greeting},\n\nYou're subscribed to Nashville Zouk updates! We'll keep you posted on upcoming socials, workshops, and events.\n\nSee you on the dance floor!\n\n---\nUnsubscribe: ${unsubscribeLink}`

  const { sendEmail } = await import('@/lib/email')
  await sendEmail({ to: email, subject: "You're on the list — Nashville Zouk", html, text })
}

export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const firstName = (formData.get('firstName') as string)?.trim() || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (!isDbConfigured()) {
    return { success: true }
  }

  const unsubscribeToken = randomUUID()

  try {
    const { db } = await import('@/lib/db')
    const { subscribers } = await import('@/lib/schema')

    await db.insert(subscribers).values({ email, firstName, unsubscribeToken })

    if (isEmailConfigured()) {
      await sendConfirmationEmail(email, firstName, unsubscribeToken).catch((err) =>
        console.error('Confirmation email failed:', err)
      )
    }

    return { success: true }
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg?.code === '23505') {
      return { success: false, error: "You're already subscribed!" }
    }
    console.error('Subscribe error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
