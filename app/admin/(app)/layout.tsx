import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.adminId) redirect('/admin/login')

  const isDev = !process.env.DATABASE_URL ||
    process.env.DATABASE_URL === 'postgresql://user:password@host/dbname?sslmode=require'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav email={session.email} />
      <div className="flex-1 flex flex-col min-w-0">
        {isDev && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 text-center">
            Demo mode — no database connected. Changes will not persist.{' '}
            <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="font-medium underline">
              Connect Neon →
            </a>
          </div>
        )}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
