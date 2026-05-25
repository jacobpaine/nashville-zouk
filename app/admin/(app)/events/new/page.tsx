import type { Metadata } from 'next'
import Link from 'next/link'
import { EventForm } from '@/components/admin/EventForm'
import { getAllFlyers } from '@/lib/queries'

export const metadata: Metadata = { title: 'New Event | Admin' }

export default async function NewEventPage() {
  const flyers = await getAllFlyers()
  const flyerOptions = flyers.map((f) => ({ id: f.id, title: f.title, imageUrl: f.imageUrl }))

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Events
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Event</h1>
      </div>
      <EventForm availableFlyers={flyerOptions} />
    </div>
  )
}
