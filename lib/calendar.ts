import type { Event } from './schema'

export function googleCalendarUrl(event: Event): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const start = fmt(new Date(event.startDatetime))
  const end = event.endDatetime ? fmt(new Date(event.endDatetime)) : fmt(new Date(new Date(event.startDatetime).getTime() + 2 * 60 * 60 * 1000))
  const location = [event.locationName, event.locationAddress].filter(Boolean).join(', ')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    location,
    details: event.description ?? '',
  })

  return `https://calendar.google.com/calendar/render?${params}`
}

export function generateICS(event: Event): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const start = fmt(new Date(event.startDatetime))
  const end = event.endDatetime
    ? fmt(new Date(event.endDatetime))
    : fmt(new Date(new Date(event.startDatetime).getTime() + 2 * 60 * 60 * 1000))
  const location = [event.locationName, event.locationAddress].filter(Boolean).join(', ')
  const now = fmt(new Date())

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nashville Zouk//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@nashvillezouk.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${location}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}
