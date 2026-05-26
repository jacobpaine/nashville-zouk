'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-black text-gray-200 leading-none mb-4">Oops</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium transition-colors min-h-0 min-w-0"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors min-h-0 min-w-0"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
