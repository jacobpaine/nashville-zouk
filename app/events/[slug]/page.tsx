export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FlyerCard } from '@/components/FlyerCard'
import { AddToCalendarButton } from '@/components/AddToCalendarButton'
import { getEventBySlug, getFlyerForEvent } from '@/lib/queries'
import { googleCalendarUrl, generateICS } from '@/lib/calendar'
import { TrackPageView } from '@/components/TrackPageView'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}
  return {
    title: event.title,
    description: event.description ?? `${event.title} — ${event.locationName}`,
  }
}

const TYPE_LABELS = { social: 'Social Dance', workshop: 'Workshop', class: 'Class' }
const TYPE_COLORS = {
  social: 'bg-pink-50 text-pink-800 border-pink-200',
  workshop: 'bg-violet-50 text-violet-700 border-violet-200',
  class: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const flyer = event.flyerId ? await getFlyerForEvent(event.flyerId) : null
  const gcalUrl = googleCalendarUrl(event)
  const icsContent = generateICS(event)

  const start = new Date(event.startDatetime)
  const end = event.endDatetime ? new Date(event.endDatetime) : null

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  })
  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago',
  })
  const endTime = end?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago',
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <TrackPageView event={{ name: 'event_detail_view', data: { slug: event.slug, title: event.title } }} />
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 min-h-0 min-w-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Events
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Event type badge */}
          <span
            className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${TYPE_COLORS[event.eventType]} mb-4`}
          >
            {TYPE_LABELS[event.eventType]}
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
            {event.title}
          </h1>

          {/* Date & Time */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{dateStr}</p>
                <p className="text-gray-500 text-sm">
                  {startTime}
                  {endTime && ` – ${endTime}`}
                  {' (Central Time)'}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{event.locationName}</p>
                {event.locationAddress && (
                  <p className="text-gray-500 text-sm">{event.locationAddress}</p>
                )}
                {event.locationUrl && (
                  <a
                    href={event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors min-h-0 min-w-0"
                  >
                    View on map →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Add to Calendar */}
          <div className="mb-8">
            <AddToCalendarButton gcalUrl={gcalUrl} icsContent={icsContent} slug={event.slug} />
          </div>

          {/* Description */}
          {event.description && (
            <div className="prose prose-gray max-w-none">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this event</h2>
              {event.description.split('\n').map((para, i) => (
                <p key={i} className="text-gray-600 leading-relaxed mb-3">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Flyer sidebar */}
        {flyer && (
          <div className="w-full lg:w-72 flex-shrink-0">
            <FlyerCard flyer={flyer} />
          </div>
        )}
      </div>
    </div>
  )
}
