'use client'

import { useState } from 'react'

interface Props {
  campaignId: string
}

export function CampaignTestSendForm({ campaignId }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    const res = await fetch(`/api/campaigns/${campaignId}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testEmail: email }),
    })
    if (res.ok) {
      setStatus('sent')
    } else {
      const data = await res.json()
      setErrorMsg(data.error ?? 'Failed to send test email.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-green-700 font-medium">
        Test email sent to {email}.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          required
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 min-h-0"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 min-h-0 min-w-0 whitespace-nowrap"
        >
          {status === 'sending' ? 'Sending…' : 'Send test email'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">{errorMsg}</p>
      )}
    </form>
  )
}
