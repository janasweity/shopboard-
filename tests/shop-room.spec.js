import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { products, money } from '../src/data/catalog.js'
import { inspirationRooms } from '../src/data/inspiration.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

for (const width of [360, 768, 1280]) {
  test(`three catalogue rooms have accurate product links, images and accessible layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/?page=inspiration')
    await expect(page.locator('h1')).toHaveText('Room Inspiration')
    await expect(page.locator('.inspiration-room')).toHaveCount(3)
    await expect(page.locator('.room-nav a')).toHaveText([
      'Living room \u2193',
      'Bedroom \u2193',
      'Kitchen \u2193',
    ])
    await expect(page.locator('.shop-the-room')).toHaveCount(0)
    for (const room of inspirationRooms) {
      const section = page.locator('#' + room.id)
      await page.locator(`.room-nav a[href="#${room.id}"]`).click()
      await expect(section).toBeInViewport()
      await expect(section.locator('figure img')).toHaveAttribute(
        'src',
        room.image,
      )
      await expect(section.locator('article')).toHaveCount(room.items.length)
      for (const item of room.items) {
        const product = products.find((product) => product.id === item.id)
        const variant = product.variants.find(
          (variant) => variant.id === item.color,
        )
        const card = section.locator(`[data-inspiration-product="${item.id}"]`)
        await expect(card.locator('h3')).toHaveText(product.name)
        await expect(card.locator('img')).toHaveAttribute('src', variant.image)
        await expect(card.locator('.inspiration-price')).toHaveText(
          money(variant.price),
        )
        const links = await card
          .locator('a')
          .evaluateAll((links) => links.map((link) => link.href))
        for (const href of links) {
          const url = new URL(href)
          expect(url.searchParams.get('id')).toBe(product.id)
          expect(url.searchParams.get('color')).toBe(variant.id)
        }
        await card
          .getByRole('link', { name: 'View product', exact: false })
          .last()
          .click()
        await expect(page.locator('h1')).toHaveText(product.name)
        await expect(page.locator('#gallery-image')).toHaveAttribute(
          'src',
          variant.image,
        )
        await page.goBack()
      }
    }
    await page.locator('img').evaluateAll((images) =>
      Promise.all(
        images.map((image) => {
          image.loading = 'eager'
          return image.decode()
        }),
      ),
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(errors).toEqual([])
    // This change owns the page content; the shared header/footer stay unchanged.
    const accessibility = await new AxeBuilder({ page })
      .include('#page-view')
      .analyze()
    expect(accessibility.violations).toEqual([])
    await page
      .locator('#living-room')
      .screenshot({ path: `test-results/inspiration-${width}.png` })
  })
}

test('room planner remains available after the three scenes', async ({
  page,
}) => {
  await page.goto('/?page=inspiration#planning')
  await page.getByLabel('Width (metres)').fill('4')
  await page.getByLabel('Length (metres)').fill('3')
  await page.getByRole('button', { name: 'Calculate room area' }).click()
  await expect(page.locator('#room-area')).toContainText('12')
})
