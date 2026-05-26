import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllEvents } from '@/lib/queries'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: 'Events | Admin' }

// Get all events (including unpublished) for admin view
async function getAdminEvents() {
  const { isDbConfigured } = await import('@/lib/config')
  if (!isDbConfigured()) {
    const { MOCK_EVENTS } = await import('@/lib/mock')
    return MOCK_EVENTS
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const { desc } = await import('drizzle-orm')
  return db.select().from(events).orderBy(desc(events.startDatetime))
}

export default async function AdminEventsPage() {
  const events = await getAdminEvents()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm min-h-0 min-w-0"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No events yet.</p>
          <Link href="/admin/events/new" className="text-pink-600 font-medium mt-2 inline-block min-h-0 min-w-0">
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Event</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{event.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {new Date(event.startDatetime).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago',
                    })}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs capitalize text-gray-600">{event.eventType}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-gray-700 min-h-0 min-w-0"
                      >
                        View ↗
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-pink-600 hover:text-pink-700 font-medium min-h-0 min-w-0"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        url={`/api/events/${event.id}`}
                        confirmMessage={`Delete "${event.title}"? This cannot be undone.`}
                      />
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
