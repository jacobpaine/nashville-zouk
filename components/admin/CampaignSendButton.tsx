'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CampaignSendButtonProps {
  campaignId: string
}

export function CampaignSendButton({ campaignId }: CampaignSendButtonProps) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!confirm('Send this campaign to all active subscribers now?')) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Send failed')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
      >
        {sending ? 'Sending…' : 'Send to all subscribers'}
      </button>
    </div>
  )
}
