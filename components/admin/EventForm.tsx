'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'

interface FlyerOption {
  id: string
  title: string
  imageUrl: string
}

interface EventFormProps {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    description?: string
    startDatetime?: string
    endDatetime?: string
    locationName?: string
    locationAddress?: string
    locationUrl?: string
    eventType?: 'social' | 'workshop' | 'class'
    isPublished?: boolean
    flyerId?: string | null
  }
  availableFlyers?: FlyerOption[]
}

const EVENT_TYPES = [
  { value: 'social', label: 'Social Dance' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'class', label: 'Class' },
] as const

// Format a UTC ISO string to a datetime-local value in Central Time
function toDatetimeInputValue(isoString: string): string {
  return new Date(isoString).toLocaleString('sv', { timeZone: 'America/Chicago' }).slice(0, 16)
}

export function EventForm({ initialData, availableFlyers = [] }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [startDatetime, setStartDatetime] = useState(
    initialData?.startDatetime ? toDatetimeInputValue(initialData.startDatetime) : ''
  )
  const [endDatetime, setEndDatetime] = useState(
    initialData?.endDatetime ? toDatetimeInputValue(initialData.endDatetime) : ''
  )
  const [locationName, setLocationName] = useState(initialData?.locationName ?? '')
  const [locationAddress, setLocationAddress] = useState(initialData?.locationAddress ?? '')
  const [locationUrl, setLocationUrl] = useState(initialData?.locationUrl ?? '')
  const [eventType, setEventType] = useState<'social' | 'workshop' | 'class'>(
    initialData?.eventType ?? 'social'
  )
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [flyerId, setFlyerId] = useState(initialData?.flyerId ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDatetime) return setError('Start date and time are required.')

    setSaving(true)
    setError(null)

    const payload = {
      title,
      slug,
      description,
      startDatetime: new Date(startDatetime).toISOString(),
      endDatetime: endDatetime ? new Date(endDatetime).toISOString() : null,
      locationName,
      locationAddress,
      locationUrl,
      eventType,
      isPublished,
      flyerId: flyerId || null,
    }

    const url = isEdit ? `/api/events/${initialData!.id}` : '/api/events'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save event.')
      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="slug">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base font-mono text-sm min-h-0"
        />
        <p className="text-xs text-gray-400 mt-1">/events/{slug || '…'}</p>
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {EVENT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer min-h-0 min-w-0">
              <input
                type="radio"
                name="eventType"
                value={t.value}
                checked={eventType === t.value}
                onChange={() => setEventType(t.value)}
                className="accent-pink-600"
              />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDatetime">
            Start <span className="text-red-500">*</span>
          </label>
          <input
            id="startDatetime"
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDatetime">
            End (optional)
          </label>
          <input
            id="endDatetime"
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-4">Times are in your browser's local timezone.</p>

      {/* Location */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="locationName">
            Venue Name <span className="text-red-500">*</span>
          </label>
          <input
            id="locationName"
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="locationAddress">
            Address
          </label>
          <input
            id="locationAddress"
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="locationUrl">
            Map URL
          </label>
          <input
            id="locationUrl"
            type="url"
            value={locationUrl}
            onChange={(e) => setLocationUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base resize-y min-h-0"
        />
      </div>

      {/* Flyer */}
      {availableFlyers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Flyer (optional)</label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFlyerId('')}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors min-h-0 min-w-0 ${
                !flyerId ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              None
            </button>
            {availableFlyers.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlyerId(f.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors min-h-0 min-w-0 ${
                  flyerId === f.id ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {f.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Publish toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setIsPublished(!isPublished)}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 min-h-0 min-w-0 ${
            isPublished ? 'bg-pink-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isPublished ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {isPublished ? 'Published' : 'Draft — not visible on public site'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-pink-700 hover:bg-pink-800 disabled:opacity-60 text-white rounded-xl font-medium transition-colors shadow-sm min-h-0 min-w-0"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 hover:border-gray-400 text-gray-600 rounded-xl font-medium transition-colors min-h-0 min-w-0"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
