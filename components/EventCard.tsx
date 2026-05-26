import Link from 'next/link'
import type { Event } from '@/lib/schema'

const TYPE_LABELS: Record<Event['eventType'], string> = {
  social: 'Social',
  workshop: 'Workshop',
  class: 'Class',
}

const TYPE_COLORS: Record<Event['eventType'], string> = {
  social: 'bg-pink-50 text-pink-800',
  workshop: 'bg-violet-50 text-violet-700',
  class: 'bg-amber-50 text-amber-700',
}

function fmt(date: Date) {
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'America/Chicago' }),
    month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'America/Chicago' }).toUpperCase(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Chicago' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' }),
  }
}

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const start = new Date(event.startDatetime)
  const { day, month, weekday, time } = fmt(start)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-100 transition-all group min-h-0 min-w-0"
    >
      {/* Date badge */}
      <div className="flex-shrink-0 w-12 text-center pt-0.5">
        <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest leading-none">{month}</p>
        <p className="text-3xl font-black text-gray-900 leading-tight">{day}</p>
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-100 flex-shrink-0" />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 leading-snug group-hover:text-pink-600 transition-colors">
          {event.title}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {weekday} · {time}
        </p>
        <p className="text-sm text-gray-400 truncate">{event.locationName}</p>
      </div>

      {/* Type badge */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[event.eventType]}`}>
          {TYPE_LABELS[event.eventType]}
        </span>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-pink-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
