import type { Metadata } from 'next'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: 'Campaigns | Admin' }

async function getAdminCampaigns() {
  const { isDbConfigured } = await import('@/lib/config')
  if (!isDbConfigured()) return []

  const { db } = await import('@/lib/db')
  const { campaigns } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt))
}

export default async function AdminCampaignsPage() {
  const campaigns = await getAdminCampaigns()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm min-h-0 min-w-0"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No campaigns yet.</p>
          <Link href="/admin/campaigns/new" className="text-pink-600 font-medium mt-2 inline-block min-h-0 min-w-0">
            Create your first campaign →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium">Subject</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Status</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Sent</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Recipients</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{campaign.subject}</p>
                    <p className="text-xs text-gray-400">
                      Created {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      campaign.status === 'sent'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {campaign.status === 'sent' ? 'Sent' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {campaign.sentAt
                      ? new Date(campaign.sentAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {campaign.recipientCount ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="text-pink-600 hover:text-pink-700 font-medium min-h-0 min-w-0"
                      >
                        {campaign.status === 'draft' ? 'Edit' : 'View'}
                      </Link>
                      {campaign.status === 'draft' && (
                        <DeleteButton
                          url={`/api/campaigns/${campaign.id}`}
                          confirmMessage={`Delete "${campaign.subject}"? This cannot be undone.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
