import type { Metadata } from 'next'
import { isDbConfigured } from '@/lib/config'

export const metadata: Metadata = { title: 'Analytics | Admin' }

async function getAnalyticsData() {
  const { db } = await import('@/lib/db')
  const { subscribers, events, campaigns, flyers } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')

  const [allSubscribers, allEvents, allCampaigns, allFlyers] = await Promise.all([
    db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt)),
    db.select().from(events),
    db.select().from(campaigns),
    db.select().from(flyers),
  ])

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const activeSubscribers = allSubscribers.filter((s) => s.isActive)
  const newThisMonth = allSubscribers.filter((s) => new Date(s.subscribedAt) >= thirtyDaysAgo)
  const upcomingEvents = allEvents.filter((e) => new Date(e.startDatetime) >= now && e.isPublished)
  const sentCampaigns = allCampaigns.filter((c) => c.status === 'sent')
  const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.recipientCount ?? 0), 0)

  const eventsByType = {
    social: allEvents.filter((e) => e.eventType === 'social').length,
    workshop: allEvents.filter((e) => e.eventType === 'workshop').length,
    class: allEvents.filter((e) => e.eventType === 'class').length,
  }

  return {
    subscribers: {
      total: allSubscribers.length,
      active: activeSubscribers.length,
      unsubscribed: allSubscribers.length - activeSubscribers.length,
      newThisMonth: newThisMonth.length,
      recent: allSubscribers.slice(0, 6),
    },
    events: {
      total: allEvents.length,
      upcoming: upcomingEvents.length,
      byType: eventsByType,
    },
    campaigns: {
      total: allCampaigns.length,
      sent: sentCampaigns.length,
      totalRecipients,
    },
    flyers: {
      total: allFlyers.length,
    },
  }
}

export default async function AnalyticsPage() {
  if (!isDbConfigured()) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-8 text-center">
          <p className="text-amber-800 font-medium">Analytics requires a connected database.</p>
          <p className="text-amber-700 text-sm mt-1">Connect a Neon database to see real data.</p>
        </div>
      </div>
    )
  }

  const data = await getAnalyticsData()

  const statCards = [
    { label: 'Active Subscribers', value: data.subscribers.active, sub: `${data.subscribers.newThisMonth} new this month` },
    { label: 'Upcoming Events', value: data.events.upcoming, sub: `${data.events.total} total` },
    { label: 'Campaigns Sent', value: data.campaigns.sent, sub: `${data.campaigns.totalRecipients.toLocaleString()} total recipients` },
    { label: 'Flyers', value: data.flyers.total, sub: null },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Subscribers</h2>
          <div className="space-y-3">
            {[
              { label: 'Active', value: data.subscribers.active, color: 'bg-green-500' },
              { label: 'Unsubscribed', value: data.subscribers.unsubscribed, color: 'bg-gray-300' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full`}
                    style={{
                      width: data.subscribers.total > 0
                        ? `${(row.value / data.subscribers.total) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Events by Type</h2>
          <div className="space-y-3">
            {[
              { label: 'Socials', value: data.events.byType.social, color: 'bg-pink-500' },
              { label: 'Workshops', value: data.events.byType.workshop, color: 'bg-purple-500' },
              { label: 'Classes', value: data.events.byType.class, color: 'bg-blue-500' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full`}
                    style={{
                      width: data.events.total > 0
                        ? `${(row.value / data.events.total) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent subscribers */}
      {data.subscribers.recent.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Subscribers</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                <th scope="col" className="text-left px-6 py-3 text-gray-500 font-medium hidden sm:table-cell">Subscribed</th>
                <th scope="col" className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.subscribers.recent.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">{sub.email}</td>
                  <td className="px-6 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {new Date(sub.subscribedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
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
