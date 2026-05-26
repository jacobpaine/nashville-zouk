'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  url: string
  label?: string
  confirmMessage?: string
  onSuccess?: () => void
}

export function DeleteButton({
  url,
  label = 'Delete',
  onSuccess,
}: DeleteButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed.')
      }
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-0.5">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2.5 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 min-h-0 min-w-0"
        >
          {deleting ? 'Deleting…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors min-h-0 min-w-0"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors min-h-0 min-w-0"
    >
      {label}
    </button>
  )
}
