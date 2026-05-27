export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllFlyers } from '@/lib/queries'
import { TrackPageView } from '@/components/TrackPageView'

export const metadata: Metadata = {
  title: 'Flyer Archive',
  description: 'Archive of Nashville Zouk event flyers.',
}

export default async function FlyersPage() {
  const flyers = await getAllFlyers()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <TrackPageView event={{ name: 'flyer_archive_view' }} />
      <h1 className="text-3xl font-black text-gray-900 mb-8">Flyer Archive</h1>

      {flyers.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No flyers yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {flyers.map((flyer) => (
            <div key={flyer.id} className="group relative">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-gray-100">
                {flyer.eventSlug ? (
                  <Link href={`/events/${flyer.eventSlug}`} className="block w-full h-full min-h-0 min-w-0">
                    <Image
                      src={flyer.imageUrl}
                      alt={flyer.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                ) : (
                  <Image
                    src={flyer.imageUrl}
                    alt={flyer.title}
                    fill
                    className="object-cover"
                  />
                )}

              </div>

              <p className="mt-2 text-sm font-medium text-gray-700 truncate">{flyer.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
