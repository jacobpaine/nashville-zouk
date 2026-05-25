import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const from = process.env.EMAIL_FROM!

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  return resend.emails.send({ from, to, subject, html, text })
}

export async function sendBatch(
  recipients: Array<{ email: string; firstName?: string | null; unsubscribeToken: string }>,
  {
    subject,
    html,
    text,
  }: {
    subject: string
    html: string
    text: string
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const batch = recipients.map(({ email, firstName, unsubscribeToken }) => {
    const unsubscribeLink = `${appUrl}/unsubscribe?token=${unsubscribeToken}`
    const personalizedHtml = html
      .replace(/{{firstName}}/g, firstName ?? 'dancer')
      .replace(/{{unsubscribeLink}}/g, unsubscribeLink)
    const personalizedText = text
      .replace(/{{firstName}}/g, firstName ?? 'dancer')
      .replace(/{{unsubscribeLink}}/g, unsubscribeLink)

    return { from, to: email, subject, html: personalizedHtml, text: personalizedText }
  })

  // Resend batch limit is 100 per call
  const results = []
  for (let i = 0; i < batch.length; i += 100) {
    const chunk = batch.slice(i, i + 100)
    results.push(await resend.batch.send(chunk))
  }
  return results
}
