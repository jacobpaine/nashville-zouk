'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'

interface InstructorFormProps {
  initialData?: {
    id?: string
    name?: string
    slug?: string
    bio?: string | null
    instagramHandle?: string | null
    displayOrder?: number
    isActive?: boolean
    photoUrl?: string | null
    photoKey?: string | null
  }
}

export function InstructorForm({ initialData }: InstructorFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!initialData?.slug)
  const [bio, setBio] = useState(initialData?.bio ?? '')
  const [instagram, setInstagram] = useState(initialData?.instagramHandle ?? '')
  const [displayOrder, setDisplayOrder] = useState(String(initialData?.displayOrder ?? 0))
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) setSlug(slugify(val))
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch(`/api/instructors/${initialData!.id}/photo`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Upload failed')
      }
      const json = await res.json()
      setPhotoUrl(json.photoUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      bio: bio.trim() || null,
      instagramHandle: instagram.trim() || null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive,
    }

    try {
      const res = await fetch(isEdit ? `/api/instructors/${initialData!.id}` : '/api/instructors', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Save failed')
      }
      router.push('/admin/instructors')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover mb-3 ring-2 ring-gray-100" />
        )}
        {isEdit ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handlePhotoUpload(f)
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-0 min-w-0 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Upload photo'}
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-400">Save the instructor first, then upload a photo.</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          placeholder="Use blank lines to separate paragraphs"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
        />
      </div>

      {/* Instagram */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram handle</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
            placeholder="username"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Display order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display order</label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          min={0}
          className="w-24 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
      </div>

      {/* Active */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors min-h-0 min-w-0 ${
            isActive ? 'bg-pink-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">Active (visible on public site)</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create instructor'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/instructors')}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
