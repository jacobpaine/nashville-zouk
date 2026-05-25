import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InstructorForm } from '@/components/admin/InstructorForm'

export const metadata: Metadata = { title: 'Edit Instructor | Admin' }

interface Props {
  params: Promise<{ id: string }>
}

async function getInstructor(id: string) {
  const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'
  const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL

  if (!isDbConfigured) {
    const { MOCK_INSTRUCTORS } = await import('@/lib/mock')
    return MOCK_INSTRUCTORS.find((i) => i.id === id) ?? null
  }

  const { db } = await import('@/lib/db')
  const { instructors } = await import('@/lib/schema')
  const { eq } = await import('drizzle-orm')
  const rows = await db.select().from(instructors).where(eq(instructors.id, id)).limit(1)
  return rows[0] ?? null
}

export default async function EditInstructorPage({ params }: Props) {
  const { id } = await params
  const instructor = await getInstructor(id)
  if (!instructor) notFound()

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/instructors"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 mb-4 min-h-0 min-w-0"
        >
          ← Back to Instructors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
      </div>
      <InstructorForm
        initialData={{
          id: instructor.id,
          name: instructor.name,
          slug: instructor.slug,
          bio: instructor.bio,
          instagramHandle: instructor.instagramHandle,
          displayOrder: instructor.displayOrder,
          isActive: instructor.isActive,
          photoUrl: instructor.photoUrl,
          photoKey: instructor.photoKey,
        }}
      />
    </div>
  )
}
