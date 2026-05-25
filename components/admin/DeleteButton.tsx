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
  confirmMessage = 'Are you sure? This cannot be undone.',
  onSuccess,
}: DeleteButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(confirmMessage)) return
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
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors disabled:opacity-50 min-h-0 min-w-0"
    >
      {deleting ? 'Deleting…' : label}
    </button>
  )
}
