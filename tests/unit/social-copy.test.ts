import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { instagramCopy, facebookCopy, meetupCopy, whatsappCopy } from '@/lib/social-copy'
import type { EventData } from '@/lib/social-copy'

const EVENT: EventData = {
  title: 'Nashville Zouk Social',
  slug: 'nashville-zouk-social',
  startDatetime: new Date('2026-06-06T21:00:00-05:00'),
  locationName: 'The Standard',
  locationAddress: '2124 8th Ave S, Nashville, TN 37204',
  description: 'A fun social dance night.',
  eventType: 'social',
}

describe('instagramCopy', () => {
  it('includes the event title', () => {
    expect(instagramCopy(EVENT)).toContain('Nashville Zouk Social')
  })

  it('includes the location', () => {
    expect(instagramCopy(EVENT)).toContain('The Standard')
  })

  it('includes Nashville Zouk hashtag', () => {
    expect(instagramCopy(EVENT)).toContain('#NashvilleZouk')
  })

  it('includes calendar and location emoji', () => {
    const copy = instagramCopy(EVENT)
    expect(copy).toContain('📅')
    expect(copy).toContain('📍')
  })

  it('falls back to "Come dance with us!" when description is null', () => {
    const event = { ...EVENT, description: null }
    expect(instagramCopy(event)).toContain('Come dance with us!')
  })
})

describe('facebookCopy', () => {
  it('includes the event title', () => {
    expect(facebookCopy(EVENT)).toContain('Nashville Zouk Social')
  })

  it('labels social events as "social dance"', () => {
    expect(facebookCopy(EVENT)).toContain('social dance')
  })

  it('labels workshop events as "workshop"', () => {
    const event = { ...EVENT, eventType: 'workshop' as const }
    expect(facebookCopy(event)).toContain('workshop')
  })

  it('includes the event URL', () => {
    expect(facebookCopy(EVENT)).toContain('/events/nashville-zouk-social')
  })
})

describe('meetupCopy', () => {
  it('includes the event title', () => {
    expect(meetupCopy(EVENT)).toContain('Nashville Zouk Social')
  })

  it('includes the location address', () => {
    expect(meetupCopy(EVENT)).toContain('2124 8th Ave S')
  })

  it('includes calendar and location emoji', () => {
    const copy = meetupCopy(EVENT)
    expect(copy).toContain('📅')
    expect(copy).toContain('📍')
  })

  it('omits address line when locationAddress is null', () => {
    const event = { ...EVENT, locationAddress: null }
    const copy = meetupCopy(event)
    expect(copy).not.toContain('null')
    expect(copy).toContain('The Standard')
  })
})

describe('whatsappCopy', () => {
  it('includes the event title in bold markdown', () => {
    expect(whatsappCopy(EVENT)).toContain('*Nashville Zouk Social*')
  })

  it('includes the location name', () => {
    expect(whatsappCopy(EVENT)).toContain('The Standard')
  })

  it('includes a Details link', () => {
    expect(whatsappCopy(EVENT)).toContain('Details:')
    expect(whatsappCopy(EVENT)).toContain('/events/nashville-zouk-social')
  })

  it('includes the music note emoji', () => {
    expect(whatsappCopy(EVENT)).toContain('🎶')
  })
})
