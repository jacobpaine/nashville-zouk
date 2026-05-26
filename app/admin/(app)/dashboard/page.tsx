import type { Metadata } from 'next'
import Link from 'next/link'
import { getUpcomingEvents, getCurrentFlyer } from '@/lib/queries'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

export default async function DashboardPage() {
  const [upcoming, currentFlyer] = await Promise.all([
    getUpcomingEvents(100),
    getCurrentFlyer(),
  ])

  const stats = [
    { label: 'Upcoming Events', value: upcoming.length, href: '/admin/events' },
    { label: 'Current Flyer', value: currentFlyer ? currentFlyer.title : 'None set', href: '/admin/flyers', small: true },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow min-h-0 min-w-0"
          >
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            <p className={`mt-1 font-bold text-gray-900 ${s.small ? 'text-base truncate' : 'text-3xl'}`}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          + New Event
        </Link>
        <Link
          href="/admin/flyers"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-400 text-gray-700 rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          Upload Flyer
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Next 5 Events</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Event</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 5).map((event) => (
                  <tr key={event.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {new Date(event.startDatetime).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago',
                      })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        event.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-pink-600 hover:text-pink-700 font-medium min-h-0 min-w-0"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
