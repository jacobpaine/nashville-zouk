'use client'

import { useState, useEffect } from 'react'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'

export default function AdminAboutPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/about')
      .then((r) => r.json())
      .then((data) => setContent(data.content ?? ''))
      .catch(() => setError('Failed to load content.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Save failed')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm min-h-0 min-w-0 disabled:opacity-50 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 h-96 animate-pulse" />
      ) : (
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write about Nashville Zouk…"
          rows={20}
        />
      )}
    </div>
  )
}
