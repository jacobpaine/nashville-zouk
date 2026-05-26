import { test, expect } from '@playwright/test'

test.describe('Admin login', () => {
  test('invalid password shows error', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill('admin@nashvillezouk.com')
    await page.locator('input[type="password"]').fill('wrong-password')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('body')).toContainText(/invalid|incorrect|wrong|error/i, { timeout: 5000 })
  })

  test('unauthenticated access to admin redirects to login', async ({ page }) => {
    await page.goto('/admin/events')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})

test.describe('Admin authenticated flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL ?? 'admin@nashvillezouk.com')
    await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD ?? 'change-me')
    await page.locator('button[type="submit"]').click()
    // Wait for redirect away from login
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 5000 }).catch(() => {})
  })

  test('dashboard loads after login', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
  })

  test('can navigate to events list', async ({ page }) => {
    await page.goto('/admin/events')
    await expect(page.locator('h1')).toContainText(/events/i)
  })

  test('new event form is accessible', async ({ page }) => {
    await page.goto('/admin/events/new')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })
})
