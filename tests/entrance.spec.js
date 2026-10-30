import { test, expect } from '@playwright/test'

test('brand intro holds, finishes within four seconds, and does not replay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.store-intro')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused()
  await expect(page.locator('#intro-title')).toHaveText('HavloHome')
  const endTimes = await page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => animation.effect.getComputedTiming().endTime),
  )
  expect(Math.max(...endTimes)).toBeGreaterThanOrEqual(3000)
  expect(Math.max(...endTimes)).toBeLessThanOrEqual(4000)
  await expect
    .poll(() =>
      page
        .locator('#intro-title')
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe('1')
  await page.screenshot({ path: 'test-results/brand-intro-1280.png' })
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-entrance',
    'playing',
    { timeout: 5000 },
  )
  await expect(page.locator('#main-content')).toBeFocused()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Products', exact: true })
    .click()
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.product-card')).toHaveCount(12)
  await expect(page.locator('.store-intro')).toHaveCount(0)
})

test('keyboard skip immediately reveals usable controls and clears animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/?page=products')
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await expect(page.locator('.entrance-card')).toHaveCount(0)
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByLabel('Find something for your home').fill('sofa')
  await page
    .getByRole('button', { name: 'Add LINDEN Sofa to cart', exact: true })
    .click()
  await expect(page.locator('#cart-count')).toHaveText('1')
})

test('replay URL works in an existing session, is consumed, and Escape skips', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() =>
    sessionStorage.setItem('havlo-entrance-seen', '1'),
  )
  await page.goto('/?intro=replay')
  await expect(page.locator('.store-intro')).toBeVisible()
  expect(new URL(page.url()).searchParams.has('intro')).toBe(false)
  await page.keyboard.press('Escape')
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.store-intro')).toHaveCount(0)
})

test('reduced motion, changed preference, and blocked storage bypass the overlay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?intro=replay')
  await expect(page.locator('.home-hero')).toBeVisible()
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/?intro=replay')
  await expect(page.locator('.store-intro')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable')
    }
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.locator('.product-card')).toHaveCount(6)
  await expect(page.locator('.store-intro')).toHaveCount(0)
})

for (const width of [360, 768, 1280]) {
  test(`intro fits ${width}px and does not wait for images`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width, height: 900 })
    await page.route('**/images/**', (route) => route.abort())
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.getByRole('button', { name: 'Skip intro' }).click()
    await expect(page.locator('.store-intro')).toHaveCount(0)
    await expect(page.locator('.home-hero')).toBeVisible()
  })
}

test('without JavaScript no intro hides the accessible page shell', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('.store-intro')).toHaveCount(0)
  await expect(page.locator('.sidebar')).toBeVisible()
  await expect(page.locator('noscript p')).toBeVisible()
  await expect(page.locator('noscript p')).toHaveText(
    'Please enable JavaScript to browse our local furniture catalogue and pages.',
  )
  await context.close()
})
