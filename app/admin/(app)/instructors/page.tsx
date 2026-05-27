import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { MOCK_INSTRUCTORS } from '@/lib/mock'

export const metadata: Metadata = { title: 'Community | Admin' }

async function getAdminInstructors() {
  const { isDbConfigured } = await import('@/lib/config')
  if (!isDbConfigured()) return MOCK_INSTRUCTORS

  const { db } = await import('@/lib/db')
  const { instructors } = await import('@/lib/schema')
  const { asc } = await import('drizzle-orm')
  return db.select().from(instructors).orderBy(asc(instructors.displayOrder))
}

export default async function AdminInstructorsPage() {
  const instructors = await getAdminInstructors()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <Link
          href="/admin/instructors/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm min-h-0 min-w-0"
        >
          + New Member
        </Link>
      </div>

      {instructors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No community members yet.</p>
          <Link href="/admin/instructors/new" className="text-pink-600 font-medium mt-2 inline-block min-h-0 min-w-0">
            Add your first member →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium">Member</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Instagram</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Order</th>
                <th scope="col" className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Status</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0">
                        {instructor.photoUrl ? (
                          <Image src={instructor.photoUrl} alt={instructor.name} fill className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-sm font-bold text-pink-300">
                            {instructor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{instructor.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{instructor.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {instructor.instagramHandle ? `@${instructor.instagramHandle}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {instructor.displayOrder}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      instructor.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {instructor.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/community/${instructor.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-gray-700 min-h-0 min-w-0"
                      >
                        View ↗
                      </Link>
                      <Link
                        href={`/admin/instructors/${instructor.id}/edit`}
                        className="text-pink-600 hover:text-pink-700 font-medium min-h-0 min-w-0"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        url={`/api/instructors/${instructor.id}`}
                        confirmMessage={`Delete "${instructor.name}"? This cannot be undone.`}
                      />
                    </div>
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
