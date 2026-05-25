import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EventForm } from '@/components/admin/EventForm'
import { SocialCopyPanel } from '@/components/admin/SocialCopyPanel'
import { getAllFlyers } from '@/lib/queries'
import { MOCK_EVENTS } from '@/lib/mock'

interface Props { params: Promise<{ id: string }> }

async function getEventById(id: string) {
  const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
  const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL

  if (!isDbConfigured) {
    return MOCK_EVENTS.find((e) => e.id === id) ?? null
  }

  const { db } = await import('@/lib/db')
  const { events } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1)
  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await getEventById(id)
  return { title: event ? `Edit: ${event.title} | Admin` : 'Edit Event | Admin' }
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const [event, flyers] = await Promise.all([getEventById(id), getAllFlyers()])
  if (!event) notFound()

  const flyerOptions = flyers.map((f) => ({ id: f.id, title: f.title, imageUrl: f.imageUrl }))

  // Serialize dates to ISO strings for the client component
  const initialData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description ?? '',
    startDatetime: new Date(event.startDatetime).toISOString(),
    endDatetime: event.endDatetime ? new Date(event.endDatetime).toISOString() : '',
    locationName: event.locationName,
    locationAddress: event.locationAddress ?? '',
    locationUrl: event.locationUrl ?? '',
    eventType: event.eventType,
    isPublished: event.isPublished,
    flyerId: event.flyerId ?? '',
  }

  const socialEvent = {
    title: event.title,
    slug: event.slug,
    startDatetime: event.startDatetime,
    locationName: event.locationName,
    locationAddress: event.locationAddress,
    description: event.description,
    eventType: event.eventType,
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Events
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        <EventForm initialData={initialData} availableFlyers={flyerOptions} />
        <SocialCopyPanel event={socialEvent} />
      </div>
    </div>
  )
}
