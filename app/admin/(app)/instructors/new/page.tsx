import type { Metadata } from 'next'
import Link from 'next/link'
import { InstructorForm } from '@/components/admin/InstructorForm'

export const metadata: Metadata = { title: 'New Instructor | Admin' }

export default function NewInstructorPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/instructors"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Instructors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Instructor</h1>
      </div>
      <InstructorForm />
    </div>
  )
}
