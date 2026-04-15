import { test, expect } from '@playwright/test'

/**
 * Smoke tests run against a live (or preview) deployment.
 * Set PLAYWRIGHT_BASE_URL=https://preview-xyz.vercel.app before running in CI.
 *
 * These tests intentionally avoid creating real Supabase users or Stripe
 * customers — they only assert on UI + error contracts that don't require
 * privileged state.
 */

test.describe('public surface smoke', () => {
  test('home page responds 200 and mentions ClinicForce', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/ClinicForce/i)
  })

  test('login page renders a form with email + password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i).first()).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()
  })

  test('protected dashboard route redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/overview')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('API contract smoke', () => {
  test('POST /api/auth/login with invalid creds returns 401 and no sensitive detail', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'nosuchuser@example.com', password: 'wrongpassword' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
    // Must not leak which half of the credential was wrong.
    expect(JSON.stringify(body).toLowerCase()).not.toContain('email not found')
    expect(JSON.stringify(body).toLowerCase()).not.toContain('no user')
  })

  test('POST /api/auth/login validates shape (Zod 400 for missing email)', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'x' },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/billing/checkout without a session returns 401', async ({ request }) => {
    const res = await request.post('/api/billing/checkout', {
      data: { plan: 'starter' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('POST /api/billing/webhook without signature returns 400', async ({ request }) => {
    const res = await request.post('/api/billing/webhook', {
      data: { fake: 'payload' },
    })
    expect([400, 500]).toContain(res.status())
  })
})
