import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import * as schema from '../lib/schema'

const { events, instructors, flyers } = schema

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set — run: npx tsx --env-file=.env.local scripts/seed.ts')

  const db = drizzle(neon(url), { schema })

  // Skip if already seeded
  const existing = await db.select().from(events).limit(1)
  if (existing.length > 0) {
    console.log('Database already has data — skipping seed.')
    return
  }

  console.log('Inserting events...')
  const insertedEvents = await db
    .insert(events)
    .values([
      {
        title: 'Nashville Zouk Social',
        slug: 'nashville-zouk-social-june-2026',
        description:
          'Join us for our monthly social dance night! All levels welcome. Open floor with Brazilian Zouk music all night. Come early for a free beginner lesson at 8pm.',
        startDatetime: new Date('2026-06-06T21:00:00-05:00'),
        endDatetime: new Date('2026-06-07T01:00:00-05:00'),
        locationName: 'The Standard',
        locationAddress: '2124 8th Ave S, Nashville, TN 37204',
        locationUrl: 'https://maps.google.com/?q=2124+8th+Ave+S+Nashville+TN',
        eventType: 'social',
        isPublished: true,
        flyerId: null,
      },
      {
        title: 'Beginner Zouk Intensive',
        slug: 'beginner-zouk-intensive-june-2026',
        description:
          'A 3-hour intensive workshop for beginners covering the fundamentals of Brazilian Zouk. No partner or prior dance experience needed. Registration required.',
        startDatetime: new Date('2026-06-14T14:00:00-05:00'),
        endDatetime: new Date('2026-06-14T17:00:00-05:00'),
        locationName: 'Nashville Dance Studio',
        locationAddress: '1900 Belmont Blvd, Nashville, TN 37212',
        locationUrl: 'https://maps.google.com/?q=1900+Belmont+Blvd+Nashville+TN',
        eventType: 'workshop',
        isPublished: true,
        flyerId: null,
      },
      {
        title: 'Zouk Fundamentals — Weekly Class',
        slug: 'zouk-fundamentals-class-june-19',
        description:
          'Ongoing weekly class series. This week: connection and lead/follow principles. Drop-ins welcome.',
        startDatetime: new Date('2026-06-19T19:00:00-05:00'),
        endDatetime: new Date('2026-06-19T20:30:00-05:00'),
        locationName: 'Centennial Arts Center',
        locationAddress: '330 31st Ave N, Nashville, TN 37203',
        locationUrl: 'https://maps.google.com/?q=330+31st+Ave+N+Nashville+TN',
        eventType: 'class',
        isPublished: true,
        flyerId: null,
      },
      {
        title: 'Nashville Zouk Social',
        slug: 'nashville-zouk-social-july-2026',
        description:
          "Our monthly social dance night. All levels welcome. Come dance Brazilian Zouk with Nashville's Zouk community.",
        startDatetime: new Date('2026-07-11T21:00:00-05:00'),
        endDatetime: new Date('2026-07-12T01:00:00-05:00'),
        locationName: 'The Standard',
        locationAddress: '2124 8th Ave S, Nashville, TN 37204',
        locationUrl: 'https://maps.google.com/?q=2124+8th+Ave+S+Nashville+TN',
        eventType: 'social',
        isPublished: true,
        flyerId: null,
      },
    ])
    .returning()

  const evtJune = insertedEvents[0]
  const evtIntensive = insertedEvents[1]
  const evtJuly = insertedEvents[3]

  console.log('Inserting instructors...')
  await db.insert(instructors).values([
    {
      name: 'Justin',
      slug: 'justin',
      bio: '',
      photoUrl: '/mock/instructor-justin.svg',
      photoKey: 'mock/instructor-justin.svg',
      instagramHandle: null,
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Shelby',
      slug: 'shelby',
      bio: '',
      photoUrl: '/mock/instructor-shelby.svg',
      photoKey: 'mock/instructor-shelby.svg',
      instagramHandle: null,
      displayOrder: 2,
      isActive: true,
    },
  ])

  console.log('Inserting flyers...')
  const insertedFlyers = await db
    .insert(flyers)
    .values([
      {
        title: 'Nashville Zouk Social — June 2026',
        imageUrl: '/mock/flyer-1.svg',
        imageKey: 'mock/flyer-1.svg',
        eventId: evtJune.id,
        isCurrent: true,
      },
      {
        title: 'Beginner Zouk Intensive — June 2026',
        imageUrl: '/mock/flyer-2.svg',
        imageKey: 'mock/flyer-2.svg',
        eventId: evtIntensive.id,
        isCurrent: false,
      },
      {
        title: 'Nashville Zouk Social — July 2026',
        imageUrl: '/mock/flyer-3.svg',
        imageKey: 'mock/flyer-3.svg',
        eventId: evtJuly.id,
        isCurrent: false,
      },
      {
        title: 'Nashville Zouk Social — May 2026',
        imageUrl: '/mock/flyer-4.svg',
        imageKey: 'mock/flyer-4.svg',
        eventId: null,
        isCurrent: false,
      },
    ])
    .returning()

  console.log('Linking June Social event to its flyer...')
  await db.update(events).set({ flyerId: insertedFlyers[0].id }).where(eq(events.id, evtJune.id))

  console.log(`Done. Inserted ${insertedEvents.length} events, 2 instructors, ${insertedFlyers.length} flyers.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
