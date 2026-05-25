import { eq, gte, and, asc, desc } from 'drizzle-orm'
import type { Event, Flyer, Instructor } from './schema'
import { MOCK_EVENTS, MOCK_FLYER, MOCK_INSTRUCTORS } from './mock'

const PLACEHOLDER_URL = 'postgresql://user:password@host/dbname?sslmode=require'

function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL
  return !!url && url !== PLACEHOLDER_URL
}

function getDb() {
  // Dynamic import to avoid module-level crash when DATABASE_URL is missing
  const { db } = require('./db') as { db: import('drizzle-orm/neon-http').NeonHttpDatabase<typeof import('./schema')> }
  return db
}

function getSchema() {
  return require('./schema') as typeof import('./schema')
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
  const rows = await db.select().from(events).where(eq(events.slug, slug)).limit(1)
  return rows[0] ?? null
}

// ─── Flyers ───────────────────────────────────────────────────────────────────

export async function getCurrentFlyer(): Promise<Flyer | null> {
  if (!isDbConfigured()) return MOCK_FLYER
  const db = getDb()
  const { flyers } = getSchema()
  const rows = await db.select().from(flyers).where(eq(flyers.isCurrent, true)).limit(1)
  return rows[0] ?? null
}

export async function getFlyerForEvent(flyerId: string): Promise<Flyer | null> {
  if (!isDbConfigured()) {
    return flyerId === MOCK_FLYER.id ? MOCK_FLYER : null
  }
  const db = getDb()
  const { flyers } = getSchema()
  const rows = await db.select().from(flyers).where(eq(flyers.id, flyerId)).limit(1)
  return rows[0] ?? null
}

export async function getAllFlyers(): Promise<Flyer[]> {
  if (!isDbConfigured()) return [MOCK_FLYER]
  const db = getDb()
  const { flyers } = getSchema()
  return db.select().from(flyers).orderBy(desc(flyers.createdAt))
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
