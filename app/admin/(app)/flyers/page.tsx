'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FlyerUploader } from '@/components/admin/FlyerUploader'
import { DeleteButton } from '@/components/admin/DeleteButton'

interface Flyer {
  id: string
  title: string
  imageUrl: string
  isCurrent: boolean
  eventId: string | null
  createdAt: string
}

export default function AdminFlyersPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [loading, setLoading] = useState(true)
  const [settingCurrent, setSettingCurrent] = useState<string | null>(null)

  async function loadFlyers() {
    const res = await fetch('/api/flyers')
    if (res.ok) setFlyers(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadFlyers() }, [])

  async function setCurrent(id: string) {
    setSettingCurrent(id)
    const res = await fetch(`/api/flyers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCurrent: true }),
    })
    if (res.ok) {
      setFlyers((prev) => prev.map((f) => ({ ...f, isCurrent: f.id === id })))
    }
    setSettingCurrent(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Flyers</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Flyer</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <FlyerUploader onSuccess={(flyer) => {
            setFlyers((prev) => [{ ...flyer, isCurrent: false, eventId: null, createdAt: new Date().toISOString() }, ...prev])
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
                  {flyer.isCurrent && (
                    <div className="absolute top-2 left-2 bg-pink-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Current
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{flyer.title}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {!flyer.isCurrent && (
                      <button
                        onClick={() => setCurrent(flyer.id)}
                        disabled={settingCurrent === flyer.id}
                        className="text-xs px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg font-medium transition-colors disabled:opacity-50 min-h-0 min-w-0"
                      >
                        {settingCurrent === flyer.id ? 'Setting…' : 'Set Current'}
                      </button>
                    )}
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
