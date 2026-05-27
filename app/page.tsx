export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FlyerCard } from '@/components/FlyerCard'
import { EventCard } from '@/components/EventCard'
import { EmailSignupForm } from '@/components/EmailSignupForm'
import { getCurrentFlyer, getUpcomingEvents, getFlyerForEvent } from '@/lib/queries'

export default async function HomePage() {
  const [currentFlyer, upcomingEvents] = await Promise.all([
    getCurrentFlyer(),
    getUpcomingEvents(5),
  ])

  // Always feature the nearest upcoming event, not whichever event the current flyer happens to link to
  const nextEvent = upcomingEvents[0] ?? null

  // Use the next event's own flyer if it has one, otherwise fall back to the admin-set current flyer
  const heroFlyer = nextEvent?.flyerId
    ? ((await getFlyerForEvent(nextEvent.flyerId)) ?? currentFlyer)
    : currentFlyer

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-950 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {nextEvent ? (
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
              {heroFlyer && (
                <div className="w-full max-w-xs mx-auto md:mx-0 md:w-80 flex-shrink-0">
                  <FlyerCard flyer={heroFlyer} eventSlug={nextEvent.slug} priority />
                </div>
              )}
              <div className="text-center md:text-left">
                <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-2">
                  Next Event
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  {nextEvent.title}
                </h1>
                <p className="text-gray-400 mt-3 text-lg">
                  {new Date(nextEvent.startDatetime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'America/Chicago',
                  })}
                </p>
                <p className="text-gray-500 mt-1">
                  {new Date(nextEvent.startDatetime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'America/Chicago',
                  })}{' '}
                  · {nextEvent.locationName}
                </p>
                <Link
                  href={`/events/${nextEvent.slug}`}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-semibold transition-colors shadow-lg min-h-0 min-w-0"
                >
                  Event Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h1 className="text-4xl md:text-5xl font-black text-white">Nashville Zouk</h1>
              <p className="text-gray-400 mt-4 text-xl">Brazilian Zouk dance in Music City</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-semibold transition-colors shadow-lg min-h-0 min-w-0"
              >
                View Events
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <Link
                href="/events"
                className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1 min-h-0 min-w-0"
              >
                See all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Email Signup */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Stay in the loop</h2>
          <p className="text-gray-500 mt-2 mb-6">
            Get notified about upcoming socials, workshops, and special events. No spam — just dance.
          </p>
          <div className="text-left">
            <EmailSignupForm />
          </div>
        </div>
      </section>
    </>
  )
}
