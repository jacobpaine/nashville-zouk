import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getInstructorBySlug } from '@/lib/queries'
import { TrackPageView } from '@/components/TrackPageView'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const instructor = await getInstructorBySlug(slug)
  if (!instructor) return {}
  return {
    title: instructor.name,
    description: instructor.bio?.slice(0, 160) ?? `${instructor.name} — Nashville Zouk instructor`,
  }
}

export default async function InstructorProfilePage({ params }: Props) {
  const { slug } = await params
  const instructor = await getInstructorBySlug(slug)
  if (!instructor) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <TrackPageView event={{ name: 'instructor_profile_view', data: { slug: instructor.slug } }} />
      <Link
        href="/instructors"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 min-h-0 min-w-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Instructors
      </Link>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Photo */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 shadow-lg ring-4 ring-white">
            {instructor.photoUrl ? (
              <Image
                src={instructor.photoUrl}
                alt={instructor.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pink-50">
                <span className="text-5xl font-black text-pink-300">
                  {instructor.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-black text-gray-900">{instructor.name}</h1>

          {instructor.instagramHandle && (
            <a
              href={`https://instagram.com/${instructor.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-pink-600 hover:text-pink-700 font-medium transition-colors min-h-0 min-w-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @{instructor.instagramHandle}
            </a>
          )}
        </div>
      </div>

      {instructor.bio && (
        <div className="mt-10">
          <div className="prose prose-gray max-w-none">
            {instructor.bio.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-lg mb-4">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
