import { eq, gte, lt, and, asc, desc } from 'drizzle-orm'
import type { Event, Instructor } from './schema'
import { MOCK_EVENTS, MOCK_FLYER, MOCK_FLYERS, MOCK_INSTRUCTORS } from './mock'
import { isDbConfigured } from './config'

export type FlyerWithSlug = {
  id: string
  title: string
  imageUrl: string
  imageKey: string
  eventId: string | null
  isCurrent: boolean
  createdAt: Date
  updatedAt: Date
  eventSlug: string | null
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getUpcomingEvents(limit = 10): Promise<Event[]> {
  if (!isDbConfigured()) {
    const now = new Date()
    return MOCK_EVENTS.filter((e) => new Date(e.startDatetime) >= now)
      .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
      .slice(0, limit)
  }
  const { db } = await import('./db')
  const { events } = await import('./schema')
  return db
    .select()
    .from(events)
    .where(and(eq(events.isPublished, true), gte(events.startDatetime, new Date())))
    .orderBy(asc(events.startDatetime))
    .limit(limit)
}

export async function getAllEvents(): Promise<Event[]> {
  if (!isDbConfigured()) {
    return [...MOCK_EVENTS].sort(
      (a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()
    )
  }
  const { db } = await import('./db')
  const { events } = await import('./schema')
  return db
    .select()
    .from(events)
    .where(eq(events.isPublished, true))
    .orderBy(desc(events.startDatetime))
}

export async function getPastEvents(limit = 20): Promise<Event[]> {
  if (!isDbConfigured()) {
    const now = new Date()
    return [...MOCK_EVENTS]
      .filter((e) => new Date(e.startDatetime) < now)
      .sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime())
      .slice(0, limit)
  }
  const { db } = await import('./db')
  const { events } = await import('./schema')
  return db
    .select()
    .from(events)
    .where(and(eq(events.isPublished, true), lt(events.startDatetime, new Date())))
    .orderBy(desc(events.startDatetime))
    .limit(limit)
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!isDbConfigured()) {
    return MOCK_EVENTS.find((e) => e.slug === slug) ?? null
  }
  const { db } = await import('./db')
  const { events } = await import('./schema')
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublished, true)))
    .limit(1)
  return rows[0] ?? null
}

// ─── Flyers ───────────────────────────────────────────────────────────────────

export async function getCurrentFlyer() {
  if (!isDbConfigured()) return MOCK_FLYER
  const { db } = await import('./db')
  const { flyers, events } = await import('./schema')
  // Return the flyer for the soonest upcoming published event that has one
  const rows = await db
    .select({ flyer: flyers })
    .from(events)
    .innerJoin(flyers, eq(events.flyerId, flyers.id))
    .where(and(eq(events.isPublished, true), gte(events.startDatetime, new Date())))
    .orderBy(asc(events.startDatetime))
    .limit(1)
  return rows[0]?.flyer ?? null
}

export async function getFlyerForEvent(flyerId: string) {
  if (!isDbConfigured()) {
    return MOCK_FLYERS.find((f) => f.id === flyerId) ?? null
  }
  const { db } = await import('./db')
  const { flyers } = await import('./schema')
  const rows = await db.select().from(flyers).where(eq(flyers.id, flyerId)).limit(1)
  return rows[0] ?? null
}

export async function getAllFlyers(): Promise<FlyerWithSlug[]> {
  if (!isDbConfigured()) {
    const eventsByid = Object.fromEntries(MOCK_EVENTS.map((e) => [e.id, e.slug]))
    return [...MOCK_FLYERS]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((f) => ({ ...f, eventSlug: f.eventId ? (eventsByid[f.eventId] ?? null) : null }))
  }
  const { db } = await import('./db')
  const { flyers, events } = await import('./schema')
  return db
    .select({
      id: flyers.id,
      title: flyers.title,
      imageUrl: flyers.imageUrl,
      imageKey: flyers.imageKey,
      eventId: flyers.eventId,
      isCurrent: flyers.isCurrent,
      createdAt: flyers.createdAt,
      updatedAt: flyers.updatedAt,
      eventSlug: events.slug,
    })
    .from(flyers)
    .leftJoin(events, eq(flyers.eventId, events.id))
    .orderBy(desc(flyers.createdAt))
}

// ─── Instructors ─────────────────────────────────────────────────────────────

export async function getActiveInstructors(): Promise<Instructor[]> {
  if (!isDbConfigured()) return MOCK_INSTRUCTORS
  const { db } = await import('./db')
  const { instructors } = await import('./schema')
  return db
    .select()
    .from(instructors)
    .where(eq(instructors.isActive, true))
    .orderBy(asc(instructors.displayOrder))
}

export async function getInstructorBySlug(slug: string): Promise<Instructor | null> {
  if (!isDbConfigured()) {
    return MOCK_INSTRUCTORS.find((i) => i.slug === slug) ?? null
  }
  const { db } = await import('./db')
  const { instructors } = await import('./schema')
  const rows = await db.select().from(instructors).where(eq(instructors.slug, slug)).limit(1)
  return rows[0] ?? null
}

// ─── About ───────────────────────────────────────────────────────────────────

export async function getAboutContent(): Promise<string> {
  if (!isDbConfigured()) {
    return `## What is Brazilian Zouk?

Brazilian Zouk is a partner dance that originated in Brazil in the 1980s, evolving from the Caribbean dance Lambada. It's known for its fluid, wave-like movements, deep connection between partners, and emphasis on musicality. The dance has grown into a worldwide community with its own festivals, competitions, and social scene.

## Nashville Zouk

We're a growing community of dancers in Music City dedicated to bringing Brazilian Zouk to Nashville. Whether you've never tried partner dancing before or you're an experienced dancer looking to expand your repertoire — you belong here.

We host regular **social dances**, **workshops**, and **weekly classes** throughout the year. Our events are welcoming, low-pressure, and a lot of fun.

## What to Expect

At a social dance, you'll find open-floor dancing with a mix of skill levels. Beginners are always welcome, and more experienced dancers love sharing the dance. No partner required — just show up.

Workshops and classes are hands-on and taught by experienced instructors. We focus on technique, connection, and musicality so you can feel confident on the floor.

## Getting Started

The best way to start is to come to a beginner class or a social dance. Comfortable shoes with smooth soles work great. No partner needed — roles rotate so everyone dances with everyone.

Follow us on Instagram or sign up for our mailing list below to stay up to date on events.`
  }
  const { db } = await import('./db')
  const { aboutContent } = await import('./schema')
  const rows = await db.select().from(aboutContent).limit(1)
  return rows[0]?.content ?? ''
}
