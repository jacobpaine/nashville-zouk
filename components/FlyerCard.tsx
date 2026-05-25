import Image from 'next/image'
import Link from 'next/link'
import type { Flyer } from '@/lib/schema'

interface FlyerCardProps {
  flyer: Flyer
  eventSlug?: string | null
  priority?: boolean
  className?: string
}

export function FlyerCard({ flyer, eventSlug, priority, className = '' }: FlyerCardProps) {
  const image = (
    <div className={`relative w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}>
      <Image
        src={flyer.imageUrl}
        alt={flyer.title}
        width={600}
        height={800}
        className="w-full h-auto object-cover"
        priority={priority}
      />
    </div>
  )

  if (eventSlug) {
    return (
      <Link href={`/events/${eventSlug}`} className="block hover:opacity-95 transition-opacity min-h-0 min-w-0">
        {image}
      </Link>
    )
  }

  return image
}
