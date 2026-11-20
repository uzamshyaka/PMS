import { expect, test, type Page } from '@playwright/test'

/**
 * Admin prototype checks. The Laravel API is not needed: the two auth calls
 * (CSRF cookie and /me) are answered here, so the app's real auth flow runs
 * unchanged. Admin data comes from the in-browser mock services.
 */
const ROLES = {
  'super-admin': ['access-admin-dashboard', 'manage-users', 'manage-roles', 'manage-permissions', 'manage-vehicles', 'review-vehicle-listings', 'manage-enquiries', 'manage-website-content', 'manage-system-settings', 'view-audit-logs'],
  'vehicle-manager': ['access-admin-dashboard', 'manage-vehicles'],
  'reviewer': ['access-admin-dashboard', 'review-vehicle-listings'],
  'enquiry-manager': ['access-admin-dashboard', 'manage-enquiries'],
} as const

async function signInAs(page: Page, role: keyof typeof ROLES) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/sanctum/csrf-cookie', (r) => r.fulfill({ status: 204 }))
  await page.route('**/api/v1/admin/auth/me', (r) => r.fulfill({
    json: { success: true, message: 'OK', meta: null, errors: null, data: { id: 1, name: 'Development Admin', email: 'admin@example.com', last_login_at: null, roles: [role], permissions: ROLES[role] } },
  }))
  await page.route('**/api/v1/admin/auth/logout', (r) => r.fulfill({ json: { success: true, message: 'Logged out', data: null, meta: null, errors: null } }))
  return errors
}

async function navItems(page: Page) {
  const nav = page.locator('aside [data-test="admin-sidebar"]').last()
  await expect(nav.locator('[data-test="nav-item"]').first()).toBeVisible()
  return nav.locator('[data-test="nav-item"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-nav')))
}

const noOverflow = async (page: Page) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
}

const ALL_ROUTES = [
  '/admin/dashboard', '/admin/vehicles', '/admin/vehicles/create', '/admin/vehicles/1', '/admin/vehicles/1/edit',
  '/admin/owners', '/admin/owners/create', '/admin/owners/1', '/admin/owners/1/edit',
  '/admin/reviews', '/admin/reviews/13', '/admin/enquiries', '/admin/enquiries/1',
  '/admin/catalogue/makes', '/admin/catalogue/models', '/admin/catalogue/features',
  '/admin/website/homepage', '/admin/website/about', '/admin/website/contact', '/admin/website/branding', '/admin/website/seo',
  '/admin/users', '/admin/users/create', '/admin/users/1', '/admin/roles', '/admin/settings', '/admin/audit-logs',
]

test.describe('admin at desktop width', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Super Admin sees every module and every route renders', async ({ page }) => {
    const errors = await signInAs(page, 'super-admin')
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/dashboard$/)

    const nav = page.locator('aside [data-test="admin-sidebar"]').last()
    for (const label of ['Dashboard', 'Vehicles', 'Owners', 'Listing Reviews', 'Enquiries', 'Vehicle Catalogue', 'Website Management', 'Users & Roles', 'Settings', 'Audit Logs']) {
      await expect(nav.locator(`[data-nav="${label}"]`)).toBeVisible()
    }
    await expect(page.locator('[data-test="prototype-notice"]')).toBeVisible()
    await expect(page.locator('[data-test="stat-tiles"] [data-test="stat-card"]')).toHaveCount(6)
    await page.screenshot({ path: 'e2e/screenshots/admin-dashboard-1440.png', fullPage: true })

    for (const path of ALL_ROUTES) {
      await page.goto(path)
      await expect(page.locator('[data-test="admin-title"]'), path).not.toHaveText('Admin')
      await expect(page.locator('[data-test="loading-state"]'), path).toHaveCount(0)
      await expect(page.locator('[data-test="error-state"]'), path).toHaveCount(0)
      await expect(page.locator('[data-test="forbidden"]'), path).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })

  test('Reviewer sees only Dashboard and Reviews and is blocked elsewhere', async ({ page }) => {
    await signInAs(page, 'reviewer')
    await page.goto('/admin/dashboard')
    const items = await navItems(page)
    expect(items).toEqual(['Dashboard', 'Listing Reviews'])

    await page.goto('/admin/vehicles')
    await expect(page.locator('[data-test="forbidden"]')).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/forbidden\?from=/)
  })

  test('Enquiry Manager menu', async ({ page }) => {
    await signInAs(page, 'enquiry-manager')
    await page.goto('/admin/dashboard')
    const items = await navItems(page)
    expect(items).toEqual(['Dashboard', 'Enquiries'])
  })

  test('Vehicle Manager menu', async ({ page }) => {
    await signInAs(page, 'vehicle-manager')
    await page.goto('/admin/dashboard')
    const items = await navItems(page)
    expect(items).toEqual(['Dashboard', 'Vehicles', 'Owners', 'Vehicle Catalogue'])
  })

  test('vehicles list filters by status and search through the URL', async ({ page }) => {
    await signInAs(page, 'super-admin')
    await page.goto('/admin/vehicles')
    await expect(page.locator('[data-test="table-row"]')).toHaveCount(10)
    // Every column, including Actions, fits without sideways scrolling inside the table.
    expect(await page.locator('[data-test="table-body"]').evaluate((el) => el.closest('.overflow-x-auto')!.scrollWidth - el.closest('.overflow-x-auto')!.clientWidth)).toBeLessThanOrEqual(0)
    await page.screenshot({ path: 'e2e/screenshots/admin-vehicles-1440.png', fullPage: true })

    await page.locator('[data-test="status-tabs"]').getByRole('tab', { name: /Pending Approval/ }).click()
    await expect(page).toHaveURL(/status=pending_approval/)
    await expect(page.locator('[data-test="table-row"]')).toHaveCount(5)
    await expect(page.locator('[data-test="table-row"] [data-test="status-badge"]').first()).toHaveText('Pending Approval')

    await page.locator('[data-test="list-search"]').fill('Harrier')
    await expect(page).toHaveURL(/search=Harrier/)
    await expect(page.locator('[data-test="table-row"]')).toHaveCount(1)
  })

  test('create a vehicle through the wizard and submit it for approval', async ({ page }) => {
    await signInAs(page, 'super-admin')
    await page.goto('/admin/vehicles/create')

    // Step 1 validation blocks progress.
    await page.locator('[data-test="next-step"]').click()
    await expect(page.locator('[data-test="step-error"]')).toBeVisible()
    await expect(page.locator('[data-test="field-error"]').first()).toBeVisible()

    await page.selectOption('select[name="ownerId"]', { label: 'Lucy Nyambura · Nairobi' })
    await page.selectOption('select[name="makeId"]', { label: 'Toyota' })
    await page.selectOption('select[name="modelId"]', { label: 'Harrier' })
    await page.selectOption('select[name="year"]', '2021')
    await page.fill('input[name="title"]', '2021 Toyota Harrier 2.0 Premium')
    await page.fill('textarea[name="description"]', 'Clean, one-owner Harrier with full service history and new tyres.')
    await page.locator('[data-test="next-step"]').click()

    await page.selectOption('select[name="payment"]', 'lipa-mdogo-mdogo')
    await page.selectOption('select[name="location"]', 'Nairobi')
    await page.fill('input[name="priceKes"]', '4300000')
    await page.fill('input[name="mileageKm"]', '52000')
    await page.selectOption('select[name="conditionGrade"]', 'Very good')
    await page.selectOption('select[name="fuel"]', 'Petrol')
    await page.selectOption('select[name="transmission"]', 'Automatic')
    await page.selectOption('select[name="bodyStyle"]', 'SUV')
    await page.fill('input[name="engineCc"]', '1986')
    await page.selectOption('select[name="drivetrain"]', 'AWD')
    await page.fill('input[name="exteriorColour"]', 'Pearl White')
    await page.locator('[data-test="next-step"]').click()

    await page.locator('[data-test="feature-search"]').fill('camera')
    await page.getByLabel('Reversing camera').check()
    await page.locator('[data-test="next-step"]').click()

    // Photos: an invalid file is rejected, valid ones previewed; second becomes primary.
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
    await page.locator('[data-test="image-input"]').setInputFiles([
      { name: 'front.png', mimeType: 'image/png', buffer: png },
      { name: 'side.png', mimeType: 'image/png', buffer: png },
      { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') },
    ])
    await expect(page.locator('[data-test="image-preview"]')).toHaveCount(2)
    await expect(page.locator('[data-test="image-errors"]')).toContainText('notes.pdf')
    await page.locator('[data-test="make-primary"]').nth(1).click()
    await expect(page.locator('[data-test="image-preview"]').nth(1).locator('[data-test="primary-badge"]')).toBeVisible()
    await page.locator('[data-test="next-step"]').click()
    await page.locator('[data-test="next-step"]').click()

    await expect(page.locator('[data-test="vehicle-summary"]')).toContainText('KES 4,300,000')
    await page.locator('[data-test="submit-approval"]').click()

    await expect(page).toHaveURL(/\/admin\/vehicles\/31$/)
    await expect(page.locator('[data-test="status-badge"]').first()).toHaveText('Pending Approval')
    await expect(page.locator('[data-test="toast"]')).toContainText('prototype')
  })

  test('reviewer must give a reason to reject; approving publishes', async ({ page }) => {
    // Navigate inside the app: a full reload resets the prototype's in-memory data.
    await signInAs(page, 'super-admin')
    await page.goto('/admin/reviews')
    await page.locator('a[href="/admin/reviews/13"]').first().click()
    await page.locator('[data-test="reject"]').click()
    await page.locator('[data-test="confirm-reason"]').fill('Too short')
    await page.locator('[data-test="confirm-ok"]').click()
    await expect(page.locator('[data-test="confirm-reason-error"]')).toBeVisible()
    await page.locator('[data-test="confirm-reason"]').fill('Please add clear photos of the dashboard and confirm the service history.')
    await page.locator('[data-test="confirm-ok"]').click()
    await expect(page).toHaveURL(/\/admin\/reviews$/)
    await expect(page.locator('a[href="/admin/reviews/13"]')).toHaveCount(0)

    // It now sits under Rejected, with the reason in its history.
    await page.getByRole('tab', { name: /Rejected/ }).click()
    await page.locator('a[href="/admin/reviews/13"]').first().click()
    await expect(page.locator('[data-test="status-badge"]').first()).toHaveText('Rejected')
    await expect(page.locator('[data-test="timeline"]')).toContainText('Please add clear photos of the dashboard')
    await expect(page.locator('[data-test="decision-panel"]')).toHaveCount(0)

    // Approving publishes.
    await page.locator('nav[aria-label="Breadcrumb"]').getByRole('link', { name: 'Listing reviews' }).click()
    await page.locator('a[href="/admin/reviews/14"]').first().click()
    await page.locator('[data-test="approve"]').click()
    await page.locator('[data-test="confirm-ok"]').click()
    await expect(page).toHaveURL(/\/admin\/reviews$/)
    await page.getByRole('tab', { name: /Approved/ }).click()
    await expect(page.locator('a[href="/admin/reviews/14"]').first()).toBeVisible()
  })

  test('enquiry status update and assignment', async ({ page }) => {
    await signInAs(page, 'super-admin')
    await page.goto('/admin/enquiries/1')
    await page.locator('[data-test="status-select"]').selectOption('contacted')
    await page.locator('[data-test="save-status"]').click()
    await expect(page.locator('h2').filter({ hasText: 'Peter Kamau' }).locator('..').locator('[data-test="status-badge"]')).toHaveText('Contacted')
    await page.locator('[data-test="assign-select"]').selectOption({ label: 'Faith Njeri' })
    await expect(page.locator('[data-test="toast"]').last()).toContainText('assigned')
    await page.locator('[data-test="note-input"]').fill('Customer will visit on Saturday.')
    await page.locator('[data-test="add-note"]').click()
    await expect(page.getByText('Customer will visit on Saturday.')).toBeVisible()
  })
})

test.describe('admin on smaller screens', () => {
  test('tablet shows an icon sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1100 })
    await signInAs(page, 'super-admin')
    await page.goto('/admin/vehicles')
    await expect(page.locator('[data-test="table-row"]').first()).toBeVisible()
    await expect(page.locator('aside')).toBeVisible()
    expect((await page.locator('aside').boundingBox())!.width).toBeLessThan(100)
    await noOverflow(page)
    await page.screenshot({ path: 'e2e/screenshots/admin-vehicles-820.png', fullPage: true })
  })

  test('mobile uses a drawer and does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await signInAs(page, 'super-admin')
    await page.goto('/admin/dashboard')
    await expect(page.locator('aside')).toBeHidden()
    await noOverflow(page)
    await page.locator('[data-test="admin-menu-toggle"]').click()
    await expect(page.locator('[data-test="admin-drawer"]')).toBeVisible()
    await page.locator('[data-test="admin-drawer"]').getByRole('link', { name: 'Enquiries' }).click()
    await expect(page).toHaveURL(/\/admin\/enquiries$/)
    await expect(page.locator('[data-test="admin-drawer"]')).toHaveCount(0)
    await expect(page.locator('[data-test="table-row"]').first()).toBeVisible()
    await noOverflow(page)
    await page.screenshot({ path: 'e2e/screenshots/admin-enquiries-390.png', fullPage: true })
  })
})
