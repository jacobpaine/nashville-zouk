'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from '@/app/actions/auth'

const initial: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-0"
        />
      </div>

      {state.error && (
        <p className="text-red-600 text-sm" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors shadow-sm min-h-0 min-w-0"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
