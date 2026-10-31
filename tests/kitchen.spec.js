import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { products } from '../src/data/catalog.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

for (const width of [360, 768, 1280]) {
  test(`kitchen slide, collection, category, and search work at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const kitchen = page.getByRole('button', {
      name: 'Kitchen & Dining',
      exact: true,
    })
    await kitchen.focus()
    await kitchen.press('Space')
    await expect(kitchen).toBeFocused()
    await expect(kitchen).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.room-slider')).toHaveAttribute(
      'data-slide',
      'kitchen',
    )
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('#products .product-card')).toHaveCount(6)
    const image = page.locator('.room-slider figure > img')
    await expect(image).toHaveAttribute(
      'src',
      '/images/kitchen/kitchen-scene.png',
    )
    await image.evaluate((image) => image.decode())
    expect(
      await image.evaluate((image) => image.naturalWidth > image.naturalHeight),
    ).toBe(true)
    const errors = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(errors.violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page
      .locator('.room-slider')
      .screenshot({ path: `test-results/kitchen-hero-${width}.png` })
    await page.getByRole('button', { name: 'Living room', exact: true }).click()
    await expect(page.locator('.room-slider')).toHaveAttribute(
      'data-slide',
      'living',
    )
    await kitchen.click()
    await page.getByRole('link', { name: 'Explore the look' }).click()
    await expect(page).toHaveURL(/collection=kitchen-dining/)
    await expect(page.locator('.product-card:visible')).toHaveCount(12)
    await expect(page.locator('.kitchen-collection-intro')).toHaveCount(0)
    await page
      .getByLabel('Category', { exact: true })
      .selectOption('kitchen-dining')
    await page.getByLabel('Find something for your home').fill('cutting')
    await expect(page.locator('.product-card:visible')).toHaveCount(1)
    await page.reload()
    await expect(page.locator('[data-id="grain-oak-boards"]')).toBeVisible()
    await page.getByRole('button', { name: 'Reset search and filters' }).click()
    await expect(page.locator('.product-card:visible')).toHaveCount(
      products.length,
    )
    await page
      .getByLabel('Category', { exact: true })
      .selectOption('kitchen-dining')
    await expect(page.locator('.product-card:visible')).toHaveCount(12)
    await page
      .getByLabel('Category', { exact: true })
      .selectOption('collection:nature-form')
    await expect(page.locator('.product-card:visible')).toHaveCount(
      products.filter((product) => product.collection === 'nature-form').length,
    )
    await page.goto('/?page=category&id=kitchen-dining')
    await expect(page.getByLabel('Category', { exact: true })).toHaveValue(
      'kitchen-dining',
    )
    await expect(page.locator('.product-card:visible')).toHaveCount(12)
    await page.locator('.product-card:visible img').evaluateAll((images) =>
      Promise.all(
        images.map((image) => {
          image.loading = 'eager'
          return image.decode()
        }),
      ),
    )
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `test-results/kitchen-products-${width}.png`,
      fullPage: true,
    })
  })
}
