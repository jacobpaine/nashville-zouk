import type { Metadata } from 'next'
import Link from 'next/link'
import { CampaignForm } from '@/components/admin/CampaignForm'

export const metadata: Metadata = { title: 'New Campaign | Admin' }

export default function NewCampaignPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/campaigns"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
      </div>
      <CampaignForm />
    </div>
  )
}
