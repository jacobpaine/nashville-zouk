export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { InstructorCard } from '@/components/InstructorCard'
import { getActiveInstructors } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Meet the Nashville Zouk community members.',
}

export default async function CommunityPage() {
  const members = await getActiveInstructors()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Community</h1>
        <p className="text-gray-500 mt-2">
          Meet the people who bring Brazilian Zouk to Nashville.
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No community members listed yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((member) => (
            <InstructorCard key={member.id} instructor={member} />
          ))}
        </div>
      )}
    </div>
  )
}
