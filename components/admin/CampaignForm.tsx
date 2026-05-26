'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'

interface CampaignFormProps {
  initialData?: {
    id?: string
    subject?: string
    bodyText?: string
  }
}

export function CampaignForm({ initialData }: CampaignFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [subject, setSubject] = useState(initialData?.subject ?? '')
  const [bodyText, setBodyText] = useState(initialData?.bodyText ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(isEdit ? `/api/campaigns/${initialData!.id}` : '/api/campaigns', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), bodyText: bodyText.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Save failed')
      }
      router.push('/admin/campaigns')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject line <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="What's the email about?"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Markdown supported. Use{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">{`{{firstName}}`}</code>{' '}
          for personalization.
        </p>
        <MarkdownEditor
          value={bodyText}
          onChange={setBodyText}
          placeholder={`Hi {{firstName}},\n\nJoin us for…`}
          rows={14}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          {saving ? 'Saving…' : isEdit ? 'Save draft' : 'Create draft'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/campaigns')}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
