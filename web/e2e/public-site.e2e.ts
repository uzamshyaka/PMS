import { expect, test, type Page } from '@playwright/test'

const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().boundingBox()
  if (!b) throw new Error(`No bounding box for ${selector}`)
  return b
}

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true, animations: 'disabled' })

test.describe('homepage at desktop width (1440px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('matches the reference layout proportions', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    // 1. Navigation: ~80px white bar, links centred, inventory button on the right.
    const header = await box(page, 'header')
    expect(header.height).toBeGreaterThanOrEqual(78)
    expect(header.height).toBeLessThanOrEqual(84)
    const nav = await box(page, 'nav[aria-label="Main"]')
    expect(Math.abs(nav.x + nav.width / 2 - 720)).toBeLessThan(90)
    await expect(page.locator('header').getByRole('link', { name: /view inventory/i })).toBeVisible()

    // 2. Hero: substantial height, headline centred.
    const hero = await box(page, '[data-test="hero"]')
    expect(hero.height).toBeGreaterThanOrEqual(560)
    expect(hero.height).toBeLessThanOrEqual(760)
    const h1 = await box(page, '#hero-title')
    expect(Math.abs(h1.x + h1.width / 2 - 720)).toBeLessThan(20)
    await expect(page.locator('#hero-title')).toContainText('Drive')
    await expect(page.locator('#hero-title')).toContainText('Excellence')

    // 3. Script heading uses the script font.
    const scriptFont = await page.locator('#hero-title span').nth(1).evaluate((el) => getComputedStyle(el).fontFamily)
    expect(scriptFont).toContain('Mr Dafoe')

    // 4. Benefits panel floats across the bottom edge of the hero.
    const benefits = await box(page, '[data-test="benefits"] ul')
    const heroBottom = hero.y + hero.height
    expect(benefits.y).toBeLessThan(heroBottom)
    expect(benefits.y + benefits.height).toBeGreaterThan(heroBottom)
    expect(benefits.width).toBeGreaterThan(900)
    expect(benefits.width).toBeLessThanOrEqual(1024)
    const benefitTops = await page.locator('[data-test="benefit"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
    expect(new Set(benefitTops).size).toBe(1)

    // 5–6. Featured inventory: four cards in one row, image dominant (21:10).
    // Sub-divided: New Cars first, then Used Cars, each four cards in one row.
    for (const group of ['new', 'used']) {
      const cardTops = await page.locator(`[data-test="featured-${group}"] [data-test="vehicle-card"]`).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
      expect(cardTops).toHaveLength(4)
      expect(new Set(cardTops).size).toBe(1)
    }
    const newBox = await box(page, '[data-test="featured-new"]')
    const usedBox = await box(page, '[data-test="featured-used"]')
    expect(newBox.y).toBeLessThan(usedBox.y)
    await expect(page.locator('[data-test="featured-new"] [data-test="new-badge"]')).toHaveCount(4)
    await expect(page.locator('[data-test="featured-used"] [data-test="new-badge"]')).toHaveCount(0)
    const image = await box(page, '[data-test="featured-grid"] [data-test="vehicle-card"] .aspect-\\[21\\/10\\]')
    expect(image.width / image.height).toBeCloseTo(2.1, 1)
    await expect(page.locator('[data-test="featured-grid"] [data-test="price"]').first()).toHaveText(/^KES [\d,]+$/)

    await expectNoHorizontalOverflow(page)
    await shot(page, 'home-1440')
  })
})

test.describe('homepage at tablet width (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('uses the burger menu, 2x2 benefits and two cards per row', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav[aria-label="Main"]')).toBeHidden()
    await expect(page.locator('[data-test="menu-toggle"]')).toBeVisible()

    const benefitTops = await page.locator('[data-test="benefit"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
    expect(new Set(benefitTops).size).toBe(2)

    const cardLefts = await page.locator('[data-test="featured-grid"] [data-test="vehicle-card"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)))
    expect(new Set(cardLefts).size).toBe(2)

    await expectNoHorizontalOverflow(page)
    await shot(page, 'home-768')
  })
})

test.describe('homepage at mobile width (390px)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('stacks cleanly with a working menu and no sideways scroll', async ({ page }) => {
    await page.goto('/')
    await expectNoHorizontalOverflow(page)

    // Compact header: one row, logo + burger only, burger fully on screen.
    const header = await box(page, 'header')
    expect(header.height).toBeLessThanOrEqual(84)
    await expect(page.locator('header').getByRole('link', { name: /view inventory/i })).toBeHidden()
    await expect(page.locator('[data-test="menu-toggle"]')).toBeInViewport({ ratio: 1 })

    const hero = await box(page, '[data-test="hero"]')
    expect(hero.height).toBeGreaterThanOrEqual(540)

    const cardLefts = await page.locator('[data-test="featured-grid"] [data-test="vehicle-card"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)))
    expect(new Set(cardLefts).size).toBe(1)

    await shot(page, 'home-390')

    await page.locator('[data-test="menu-toggle"]').click()
    await expect(page.locator('[data-test="mobile-nav"]')).toBeVisible()
    await page.locator('[data-test="mobile-nav"]').getByRole('link', { name: 'Inventory', exact: true }).click()
    await expect(page).toHaveURL(/\/inventory$/)
    await expect(page.locator('[data-test="mobile-nav"]')).toBeHidden()
  })
})

test.describe('inventory and details', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('filters are server-rendered from the URL and update it', async ({ page }) => {
    await page.goto('/inventory?body=SUV&sort=price-asc')
    await expect(page.locator('[data-test="result-count"]')).toContainText('8 vehicles')

    await page.locator('select[name="make"]').selectOption('BMW')
    await expect(page).toHaveURL(/make=BMW/)
    await expect(page.locator('[data-test="result-count"]')).toContainText('1 vehicle')

    await page.locator('[data-test="clear-filters"]').click()
    await expect(page.locator('[data-test="result-count"]')).toContainText('12 vehicles')
    await expectNoHorizontalOverflow(page)
    await shot(page, 'inventory-1440')
  })

  test('inventory is paginated and ordered by date added, newest first', async ({ page }) => {
    await page.goto('/inventory')
    await expect(page.locator('[data-test="result-count"]')).toContainText('Showing 1–9 of 12 vehicles')
    await expect(page.locator('[data-test="inventory-grid"] [data-test="vehicle-card"]')).toHaveCount(9)
    const firstPageDates = await page.locator('[data-test="added-date"] time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime')!))
    expect(firstPageDates).toEqual([...firstPageDates].sort().reverse())
    await expect(page.locator('[data-test="inventory-grid"] h3').first()).toContainText('Mercedes-Benz GLC')

    await page.locator('[data-test="page-next"]').click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.locator('[data-test="result-count"]')).toContainText('Showing 10–12 of 12 vehicles')
    const secondPageDates = await page.locator('[data-test="added-date"] time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime')!))
    expect(secondPageDates).toHaveLength(3)
    expect(secondPageDates[0]! < firstPageDates.at(-1)!).toBe(true)
    await expect(page.locator('[data-test="pagination"] [aria-current="page"]')).toHaveText('2')
    // Only one item anywhere in the header nav is marked as the current page.
    await expect(page.locator('header nav[aria-label="Main"] [aria-current="page"]')).toHaveText('Inventory')

    // Changing a filter or sort returns to page 1.
    await page.locator('select[name="sort"]').selectOption('oldest')
    await expect(page).not.toHaveURL(/page=/)
    await expect(page.locator('[data-test="inventory-grid"] h3').first()).toContainText('Lexus RX')
    await expectNoHorizontalOverflow(page)
  })

  test('one page lists new and used together; condition, payment and location are filters', async ({ page }) => {
    await page.goto('/inventory')
    await expect(page.locator('[data-test="type-tabs"]')).toHaveCount(0)
    await expect(page.locator('h1')).toHaveText('Vehicle Inventory')
    // First page mixes new (badged) and used cars.
    const newBadges = await page.locator('[data-test="inventory-grid"] [data-test="new-badge"]').count()
    expect(newBadges).toBeGreaterThan(0)
    expect(newBadges).toBeLessThan(9)

    await page.locator('select[name="type"]').selectOption('new')
    await expect(page).toHaveURL(/type=new/)
    await expect(page.locator('[data-test="result-count"]')).toContainText('4 vehicles')

    await page.locator('select[name="payment"]').selectOption('lipa-mdogo-mdogo')
    await expect(page.locator('[data-test="result-count"]')).toContainText('2 vehicles')
    await expect(page.locator('[data-test="payment"]')).toHaveText(['Lipa Mdogo Mdogo', 'Lipa Mdogo Mdogo'])

    await page.locator('[data-test="clear-filters"]').click()
    await page.locator('select[name="location"]').selectOption('Mombasa')
    await expect(page.locator('[data-test="result-count"]')).toContainText('3 vehicles')
    await expect(page.locator('[data-test="location"]')).toHaveText(['Mombasa', 'Mombasa', 'Mombasa'])
  })

  test('homepage new/used rows open the single inventory page pre-filtered', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-test="featured-new"]').getByRole('link', { name: /see all new cars/i }).click()
    await expect(page).toHaveURL(/\/inventory\?type=new$/)
    await expect(page.locator('select[name="type"]')).toHaveValue('new')
    await expect(page.locator('[data-test="result-count"]')).toContainText('4 vehicles')
  })

  test('details page shows price, specs, inspections and showroom contact', async ({ page }) => {
    await page.goto('/inventory/range-rover-evoque-2020')
    await expect(page.locator('h1')).toContainText('Range Rover Evoque')
    await expect(page.locator('[data-test="detail-price"]')).toHaveText('KES 6,290,000')
    await expect(page.locator('[data-test="verified-badge"]')).toHaveCount(1)
    await expect(page.locator('[data-test="enquiry-panel"] a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('[data-test="detail-location"]')).toHaveText('Nairobi')
    await expect(page.locator('[data-test="detail-payment"]')).toHaveText('Lipa Mdogo Mdogo')
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
    await expectNoHorizontalOverflow(page)
    await shot(page, 'details-1440')
  })

  test('unknown vehicles return 404', async ({ page }) => {
    const response = await page.goto('/inventory/not-a-real-car')
    expect(response?.status()).toBe(404)
  })
})

test('public pages are server-rendered; admin stays client-only', async ({ request }) => {
  const home = await (await request.get('/')).text()
  expect(home).toContain('Find your perfect drive')
  expect(home).toContain('KES 5,490,000')

  const admin = await (await request.get('/admin/login')).text()
  expect(admin).not.toContain('Sign in')
})
