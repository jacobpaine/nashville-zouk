export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { EventCard } from '@/components/EventCard'
import { getAllEvents } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming Nashville Zouk socials, workshops, and classes.',
}

export default async function EventsPage() {
  const events = await getAllEvents()
  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.startDatetime) >= now)
  const past = events.filter((e) => new Date(e.startDatetime) < now)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Events</h1>

      {upcoming.length > 0 ? (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Upcoming
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-gray-500 text-center py-16">
          No upcoming events right now. Check back soon!
        </p>
      )}

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Past Events
          </h2>
          <div className="flex flex-col gap-3 opacity-60">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
