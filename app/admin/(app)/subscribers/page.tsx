'use client'

import { useState, useEffect } from 'react'

interface Subscriber {
  id: string
  email: string
  firstName: string | null
  subscribedAt: string
  isActive: boolean
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/subscribers')
      .then((r) => r.json())
      .then(setSubscribers)
      .catch(() => setError('Failed to load subscribers.'))
      .finally(() => setLoading(false))
  }, [])

  const active = subscribers.filter((s) => s.isActive)
  const inactive = subscribers.filter((s) => !s.isActive)

  function handleExport() {
    window.location.href = '/api/subscribers/export'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {active.length} active · {inactive.length} unsubscribed
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors min-h-0 min-w-0"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Name</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Subscribed</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{sub.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {sub.firstName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {new Date(sub.subscribedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
