import { eq, gte, and, asc, desc } from 'drizzle-orm'
import type { Event, Instructor } from './schema'
import { MOCK_EVENTS, MOCK_FLYER, MOCK_FLYERS, MOCK_INSTRUCTORS } from './mock'
import { isDbConfigured } from './config'

function getDb() {
  const { db } = require('./db') as { db: import('drizzle-orm/neon-http').NeonHttpDatabase<typeof import('./schema')> }
  return db
}

function getSchema() {
  return require('./schema') as typeof import('./schema')
}

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
  const db = getDb()
  const { events } = getSchema()
  return db
    .select()
    .from(events)
    .where(and(eq(events.isPublished, true), gte(events.startDatetime, new Date())))
    .orderBy(asc(events.startDatetime))
    .limit(limit)
}

export async function getAllEvents(): Promise<Event[]> {
  if (!isDbConfigured()) {
    return MOCK_EVENTS.sort(
      (a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()
    )
  }
  const db = getDb()
  const { events } = getSchema()
  return db
    .select()
    .from(events)
    .where(eq(events.isPublished, true))
    .orderBy(desc(events.startDatetime))
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!isDbConfigured()) {
    return MOCK_EVENTS.find((e) => e.slug === slug) ?? null
  }
  const db = getDb()
  const { events } = getSchema()
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
  const db = getDb()
  const { flyers } = getSchema()
  const rows = await db.select().from(flyers).where(eq(flyers.isCurrent, true)).limit(1)
  return rows[0] ?? null
}

export async function getFlyerForEvent(flyerId: string) {
  if (!isDbConfigured()) {
    return MOCK_FLYERS.find((f) => f.id === flyerId) ?? null
  }
  const db = getDb()
  const { flyers } = getSchema()
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
  const db = getDb()
  const { flyers, events } = getSchema()
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
  const db = getDb()
  const { instructors } = getSchema()
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
  const db = getDb()
  const { instructors } = getSchema()
  const rows = await db.select().from(instructors).where(eq(instructors.slug, slug)).limit(1)
  return rows[0] ?? null
}

// ─── About ───────────────────────────────────────────────────────────────────

export async function getAboutContent(): Promise<string> {
  if (!isDbConfigured()) {
    return `## Welcome to Nashville Zouk

Brazilian Zouk is a partner dance that originated in Brazil, characterized by its fluid movements, connection between partners, and musicality.

Nashville Zouk brings this beautiful dance to Music City. We host regular social dances, workshops, and classes for all levels — from complete beginners to experienced dancers.

Whether you're brand new to partner dancing or looking to expand your repertoire, you're welcome here.`
  }
  const db = getDb()
  const { aboutContent } = getSchema()
  const rows = await db.select().from(aboutContent).limit(1)
  return rows[0]?.content ?? ''
}
