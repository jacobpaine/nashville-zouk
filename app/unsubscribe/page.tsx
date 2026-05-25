import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false },
}

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
function isDbConfigured() {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL
}

type Result = 'success' | 'already' | 'invalid' | 'dev'

async function processUnsubscribe(token: string): Promise<Result> {
  if (!isDbConfigured()) return 'dev'

  const { db } = await import('@/lib/db')
  const { subscribers } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')

  const rows = await db.select().from(subscribers).where(eq(subscribers.unsubscribeToken, token)).limit(1)
  const subscriber = rows[0]

  if (!subscriber) return 'invalid'
  if (!subscriber.isActive) return 'already'

  await db.update(subscribers)
    .set({ isActive: false, unsubscribedAt: new Date() })
    .where(eq(subscribers.id, subscriber.id))

  return 'success'
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return (
      <UnsubscribeShell>
        <p className="text-gray-600">This unsubscribe link is invalid or expired.</p>
        <HomeLink />
      </UnsubscribeShell>
    )
  }

  const result = await processUnsubscribe(token)

  return (
    <UnsubscribeShell>
      {result === 'success' && (
        <>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You've been unsubscribed</h2>
          <p className="text-gray-500 text-sm">
            You won't receive any more emails from us. We'll miss you on the dance floor!
          </p>
        </>
      )}
      {result === 'already' && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Already unsubscribed</h2>
          <p className="text-gray-500 text-sm">You're already off the list.</p>
        </>
      )}
      {result === 'invalid' && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link not recognized</h2>
          <p className="text-gray-500 text-sm">
            This unsubscribe link is invalid or has already been used.
          </p>
        </>
      )}
      {result === 'dev' && (
        <>
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demo mode</h2>
          <p className="text-gray-500 text-sm">
            Unsubscribe will work once a database is connected.
          </p>
        </>
      )}
      <HomeLink />
    </UnsubscribeShell>
  )
}

function UnsubscribeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
        {children}
      </div>
    </div>
  )
}

function HomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 mt-6 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors min-h-0 min-w-0"
    >
      ← Back to Nashville Zouk
    </Link>
  )
}
