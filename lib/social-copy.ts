// Works with both Drizzle Event objects (Date) and serialized events (string)
export interface EventData {
  title: string
  slug: string
  startDatetime: Date | string
  locationName: string
  locationAddress?: string | null
  description?: string | null
  eventType: 'social' | 'workshop' | 'class'
}

function formatDate(dt: Date | string): string {
  return new Date(dt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  })
}

function formatTime(dt: Date | string): string {
  return new Date(dt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago',
  })
}

function eventUrl(event: EventData): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nashvillezouk.com'
  return `${base}/events/${event.slug}`
}

export function instagramCopy(event: EventData): string {
  return `${event.title}
📅 ${formatDate(event.startDatetime)} · ${formatTime(event.startDatetime)}
📍 ${event.locationName}

${event.description ?? 'Come dance with us!'}

#NashvilleZouk #BrazilianZouk #Nashville #Zouk #SocialDance`
}

export function facebookCopy(event: EventData): string {
  const typeLabel = event.eventType === 'social' ? 'social dance' : event.eventType
  return `${event.title}

Join us for a ${typeLabel} on ${formatDate(event.startDatetime)} at ${formatTime(event.startDatetime)} — ${event.locationName}!

${event.description ?? ''}

Details + add to calendar: ${eventUrl(event)}`
}

export function meetupCopy(event: EventData): string {
  const location = [event.locationName, event.locationAddress].filter(Boolean).join('\n')
  return `${event.title}

${event.description ?? ''}

📅 ${formatDate(event.startDatetime)} · ${formatTime(event.startDatetime)}
📍 ${location}`
}

export function whatsappCopy(event: EventData): string {
  return `🎶 *${event.title}*
${formatDate(event.startDatetime)} · ${formatTime(event.startDatetime)}
${event.locationName}

${event.description ?? ''}

Details: ${eventUrl(event)}`
}
