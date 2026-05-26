import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('lowercases and trims', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('Nashville Zouk Social')).toBe('nashville-zouk-social')
  })

  it('strips special characters', () => {
    expect(slugify("What's Up? Dance!")).toBe('whats-up-dance')
  })

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('a  b---c')).toBe('a-b-c')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles already-valid slug', () => {
    expect(slugify('nashville-zouk')).toBe('nashville-zouk')
  })

  it('strips accented characters', () => {
    expect(slugify('São Paulo')).toBe('so-paulo')
  })
})
