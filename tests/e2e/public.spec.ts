import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and shows upcoming events', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    // Events section or flyer should be present
    await expect(page.locator('body')).toContainText(/event|social|zouk/i)
  })
})

test.describe('Events list', () => {
  test('shows upcoming events', async ({ page }) => {
    await page.goto('/events')
    await expect(page.locator('h1')).toContainText(/events/i)
  })
})

test.describe('Event detail', () => {
  test('shows full event content and add-to-calendar button', async ({ page }) => {
    // Navigate to events list and click the first event
    await page.goto('/events')
    const firstEvent = page.locator('a[href^="/events/"]').first()
    await firstEvent.click()

    // Should have a title, location, and add-to-calendar
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText(/add to calendar/i)).toBeVisible()
  })
})

test.describe('Community', () => {
  test('community grid loads', async ({ page }) => {
    await page.goto('/community')
    await expect(page.locator('h1')).toContainText(/community/i)
  })

  test('community member profile page loads', async ({ page }) => {
    await page.goto('/community')
    const firstCard = page.locator('a[href^="/community/"]').first()
    await firstCard.click()
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Flyer archive', () => {
  test('loads', async ({ page }) => {
    await page.goto('/flyers')
    await expect(page.locator('h1')).toContainText(/flyer/i)
  })
})

test.describe('Email signup', () => {
  test('submits and shows success', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill(`test+${Date.now()}@example.com`)
    await page.locator('button[type="submit"]').first().click()
    // Should show some success feedback (or "already subscribed" in dev mode)
    await expect(page.locator('body')).toContainText(/subscrib/i, { timeout: 5000 })
  })
})
