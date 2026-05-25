import type { MetadataRoute } from 'next'
import { getAllEvents, getActiveInstructors } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nashvillezouk.com'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/instructors`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/flyers`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ]

  const [events, instructors] = await Promise.all([
    getAllEvents(),
    getActiveInstructors(),
  ])

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${base}/events/${event.slug}`,
    lastModified: new Date(event.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const instructorRoutes: MetadataRoute.Sitemap = instructors.map((instructor) => ({
    url: `${base}/instructors/${instructor.slug}`,
    lastModified: new Date(instructor.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...eventRoutes, ...instructorRoutes]
}
