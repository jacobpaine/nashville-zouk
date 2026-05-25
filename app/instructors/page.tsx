import type { Metadata } from 'next'
import { InstructorCard } from '@/components/InstructorCard'
import { getActiveInstructors } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Instructors',
  description: 'Meet the Nashville Zouk instructors and community leaders.',
}

export default async function InstructorsPage() {
  const instructors = await getActiveInstructors()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Instructors</h1>
        <p className="text-gray-500 mt-2">
          Meet the people who bring Brazilian Zouk to Nashville.
        </p>
      </div>

      {instructors.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No instructors listed yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      )}
    </div>
  )
}
