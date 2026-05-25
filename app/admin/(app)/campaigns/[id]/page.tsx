import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CampaignForm } from '@/components/admin/CampaignForm'
import { CampaignSendButton } from '@/components/admin/CampaignSendButton'

export const metadata: Metadata = { title: 'Campaign | Admin' }

interface Props {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string) {
  const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
  const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL

  if (!isDbConfigured) return null

  const { db } = await import('@/lib/db')
  const { campaigns } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')
  const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1)
  return rows[0] ?? null
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params
  const campaign = await getCampaign(id)
  if (!campaign) notFound()

  const isSent = campaign.status === 'sent'

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/campaigns"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Campaigns
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.subject}</h1>
            {isSent && (
              <p className="text-sm text-gray-500 mt-1">
                Sent to {campaign.recipientCount} subscriber{campaign.recipientCount !== 1 ? 's' : ''} on{' '}
                {new Date(campaign.sentAt!).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            )}
          </div>
          <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            isSent ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isSent ? 'Sent' : 'Draft'}
          </span>
        </div>
      </div>

      {isSent ? (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Email body</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {campaign.bodyText}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl">
          <CampaignForm
            initialData={{
              id: campaign.id,
              subject: campaign.subject,
              bodyText: campaign.bodyText,
            }}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-amber-900 mb-2">Ready to send?</h2>
            <p className="text-sm text-amber-700 mb-4">
              This will email all active subscribers immediately. This action cannot be undone.
            </p>
            <CampaignSendButton campaignId={campaign.id} />
          </div>
        </div>
      )}
    </div>
  )
}
