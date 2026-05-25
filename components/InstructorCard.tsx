import Image from 'next/image'
import Link from 'next/link'
import type { Instructor } from '@/lib/schema'

interface InstructorCardProps {
  instructor: Instructor
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <Link
      href={`/instructors/${instructor.slug}`}
      className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-100 transition-all min-h-0 min-w-0"
    >
      <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-100 mb-4 ring-4 ring-white shadow-md">
        {instructor.photoUrl ? (
          <Image
            src={instructor.photoUrl}
            alt={instructor.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-50">
            <span className="text-3xl font-black text-pink-300">
              {instructor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
        {instructor.name}
      </p>

      {instructor.instagramHandle && (
        <p className="text-sm text-gray-400 mt-1">@{instructor.instagramHandle}</p>
      )}
    </Link>
  )
}
