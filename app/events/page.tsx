export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { EventCard } from '@/components/EventCard'
import { getUpcomingEvents } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming Nashville Zouk socials, workshops, and classes.',
}

export default async function EventsPage() {
  const upcoming = await getUpcomingEvents(50)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Events</h1>

      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">
          No upcoming events right now. Check back soon!
        </p>
      )}
    </div>
  )
}
