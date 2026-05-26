'use client'

import { useActionState, useEffect } from 'react'
import { subscribeAction, type SubscribeState } from '@/app/actions/subscribe'
import { trackEvent } from '@/lib/analytics'

const initialState: SubscribeState = { success: false }

export function EmailSignupForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialState)

  useEffect(() => {
    if (state.success) trackEvent({ name: 'email_signup_submit' })
  }, [state.success])

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-green-700 font-medium">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        You're subscribed! We'll see you on the dance floor.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          autoComplete="email"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base bg-white min-h-0"
        />
        <input
          type="text"
          name="firstName"
          placeholder="First name (optional)"
          autoComplete="given-name"
          className="sm:w-44 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base bg-white min-h-0"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-pink-700 hover:bg-pink-800 disabled:opacity-60 text-white rounded-xl font-medium transition-colors whitespace-nowrap shadow-sm min-h-0 min-w-0"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {state.error && (
        <p className="text-red-600 text-sm" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
