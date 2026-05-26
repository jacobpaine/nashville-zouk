import { describe, it, expect } from 'vitest'
import { googleCalendarUrl, generateICS } from '@/lib/calendar'
import type { Event } from '@/lib/schema'

const BASE_EVENT: Event = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Nashville Zouk Social',
  slug: 'nashville-zouk-social',
  description: 'A fun social dance night.',
  startDatetime: new Date('2026-06-06T21:00:00-05:00'),
  endDatetime: new Date('2026-06-07T01:00:00-05:00'),
  locationName: 'The Standard',
  locationAddress: '2124 8th Ave S, Nashville, TN 37204',
  locationUrl: 'https://maps.google.com/?q=test',
  eventType: 'social',
  isPublished: true,
  flyerId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

describe('googleCalendarUrl', () => {
  it('returns a google calendar URL', () => {
    const url = googleCalendarUrl(BASE_EVENT)
    expect(url).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/render/)
  })

  it('includes the event title', () => {
    const url = googleCalendarUrl(BASE_EVENT)
    expect(url).toContain('Nashville+Zouk+Social')
  })

  it('includes the location', () => {
    const url = googleCalendarUrl(BASE_EVENT)
    expect(url).toContain('The+Standard')
  })

  it('includes properly formatted dates', () => {
    const url = googleCalendarUrl(BASE_EVENT)
    // dates param should be in YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ format
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/)
  })

  it('defaults end time to +2h when endDatetime is null', () => {
    const event = { ...BASE_EVENT, endDatetime: null }
    const url = googleCalendarUrl(event)
    expect(url).toContain('dates=')
  })
})

describe('generateICS', () => {
  it('starts and ends with VCALENDAR', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toMatch(/^BEGIN:VCALENDAR/)
    expect(ics).toMatch(/END:VCALENDAR$/)
  })

  it('contains a VEVENT block', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
  })

  it('includes the event title as SUMMARY', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toContain('SUMMARY:Nashville Zouk Social')
  })

  it('includes the location', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toContain('LOCATION:The Standard')
  })

  it('includes DTSTART and DTEND', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/)
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/)
  })

  it('uses \\r\\n line endings', () => {
    const ics = generateICS(BASE_EVENT)
    expect(ics).toContain('\r\n')
  })

  it('omits DESCRIPTION line when description is null', () => {
    const event = { ...BASE_EVENT, description: null }
    const ics = generateICS(event)
    expect(ics).not.toContain('DESCRIPTION:')
  })
})
