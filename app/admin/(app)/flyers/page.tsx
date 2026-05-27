'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FlyerUploader } from '@/components/admin/FlyerUploader'
import { DeleteButton } from '@/components/admin/DeleteButton'

interface Flyer {
  id: string
  title: string
  imageUrl: string
  eventId: string | null
  createdAt: string
}

export default function AdminFlyersPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [loading, setLoading] = useState(true)

  async function loadFlyers() {
    const res = await fetch('/api/flyers')
    if (res.ok) setFlyers(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadFlyers() }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Flyers</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Flyer</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <FlyerUploader onSuccess={(flyer) => {
            setFlyers((prev) => [{ ...flyer, eventId: null, createdAt: new Date().toISOString() }, ...prev])
          }} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Flyer Library</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : flyers.length === 0 ? (
          <p className="text-gray-500 text-sm">No flyers yet. Upload one above.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {flyers.map((flyer) => (
              <div key={flyer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={flyer.imageUrl}
                    alt={flyer.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{flyer.title}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <DeleteButton
                      url={`/api/flyers/${flyer.id}`}
                      confirmMessage={`Delete "${flyer.title}"? This will also remove it from any associated events.`}
                      onSuccess={() => setFlyers((prev) => prev.filter((f) => f.id !== flyer.id))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
