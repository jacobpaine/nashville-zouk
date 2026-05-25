'use client'

import { useState } from 'react'
import { instagramCopy, facebookCopy, meetupCopy, whatsappCopy, type EventData } from '@/lib/social-copy'

interface SocialCopyPanelProps {
  event: EventData
}

const PLATFORMS = ['Instagram', 'Facebook', 'Meetup', 'WhatsApp'] as const
type Platform = (typeof PLATFORMS)[number]

function getCopy(event: EventData, platform: Platform): string {
  switch (platform) {
    case 'Instagram': return instagramCopy(event)
    case 'Facebook': return facebookCopy(event)
    case 'Meetup': return meetupCopy(event)
    case 'WhatsApp': return whatsappCopy(event)
  }
}

export function SocialCopyPanel({ event }: SocialCopyPanelProps) {
  const [platform, setPlatform] = useState<Platform>('Instagram')
  const [copied, setCopied] = useState(false)

  const copy = getCopy(event, platform)

  async function handleCopy() {
    await navigator.clipboard.writeText(copy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Social Copy</h2>

      <div className="flex gap-1 mb-4 flex-wrap">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPlatform(p); setCopied(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-0 min-w-0 ${
              platform === p
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed min-h-[120px] mb-3">
        {copy}
      </pre>

      <button
        type="button"
        onClick={handleCopy}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors min-h-0 min-w-0 ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-900 text-white hover:bg-gray-700'
        }`}
      >
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  )
}
