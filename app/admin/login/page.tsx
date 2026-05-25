import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Admin Login | Nashville Zouk' }

export default async function LoginPage() {
  const session = await getSession()
  if (session.adminId) redirect('/admin/events')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-white font-bold text-xl">Nashville Zouk</p>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Sign in</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
