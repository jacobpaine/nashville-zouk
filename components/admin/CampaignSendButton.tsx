'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CampaignSendButtonProps {
  campaignId: string
}

export function CampaignSendButton({ campaignId }: CampaignSendButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
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
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {confirming ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-amber-800">Send to all subscribers now?</span>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
          >
            {sending ? 'Sending…' : 'Confirm send'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          Send to all subscribers
        </button>
      )}
    </div>
  )
}
