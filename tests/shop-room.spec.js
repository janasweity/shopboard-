import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { products, money } from '../src/data/catalog.js'
import { shopRoom } from '../src/data/shop-room.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

for (const width of [768, 1280]) {
  test(`room hotspots match image positions, products, and keyboard behavior at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?page=inspiration')
    await expect(
      page.getByRole('heading', { name: 'Shop the Room', exact: true }),
    ).toBeVisible()
    await expect(page.locator('#shop-room-subtitle')).toHaveText(
      'A considered space. Discover every detail.',
    )
    await expect(page.locator('.collection-showcase')).toHaveCount(0)
    await expect(
      page.getByText('Find your kind of warmth.', { exact: true }),
    ).toHaveCount(0)
    await expect(page.locator('.shop-room-photo')).toHaveCount(1)
    await expect(page.locator(`img[src="${shopRoom.image}"]`)).toHaveCount(1)
    await page.locator('.shop-the-room').scrollIntoViewIfNeeded()
    await page.locator('.shop-room-photo').evaluate((image) => image.decode())
    const panel = page.locator('#shop-room-panel')
    expect(
      await page
        .locator('.room-hotspot')
        .first()
        .evaluate(
          (button) => getComputedStyle(button, '::before').animationName,
        ),
    ).toBe('room-beacon')
    for (const item of shopRoom.items) {
      const product = products.find((product) => product.id === item.id)
      const variant = product.variants.find(
        (variant) => variant.id === item.color,
      )
      const trigger = page.locator(`[data-room-hotspot="${item.id}"]`)
      const currentImage = await page.locator('.shop-room-photo').boundingBox()
      const target = await trigger.boundingBox()
      expect(target.width).toBeGreaterThanOrEqual(44)
      expect(
        Math.abs(
          target.x +
            target.width / 2 -
            (currentImage.x + (currentImage.width * item.x) / 100),
        ),
      ).toBeLessThan(1)
      expect(
        Math.abs(
          target.y +
            target.height / 2 -
            (currentImage.y + (currentImage.height * item.y) / 100),
        ),
      ).toBeLessThan(1)
      await trigger.focus()
      await trigger.press('Enter')
      await expect(panel).toBeVisible()
      await expect(panel).toHaveAttribute('aria-modal', 'false')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(
        panel.getByRole('button', { name: 'Close product panel' }),
      ).toBeFocused()
      await expect(panel.locator('h3')).toHaveText(product.name)
      await expect(panel.locator('img')).toHaveAttribute('src', variant.image)
      await panel.locator('img').evaluate((image) => image.decode())
      await expect(panel.locator('.room-panel-price')).toHaveText(
        money(variant.price),
      )
      await expect(
        panel.getByRole('link', { name: 'View product' }),
      ).toHaveAttribute(
        'href',
        `/?page=product&id=${item.id}&color=${item.color}`,
      )
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.press('Space')
      await panel.getByRole('link', { name: 'View product' }).click()
      await expect(page.locator('h1')).toHaveText(product.name)
      await expect(page.locator('#selected-color strong')).toHaveText(
        variant.name,
      )
      await page.goBack()
      await expect(page.locator('#shop-room-panel')).toBeHidden()
      await expect(page.locator('#main-content')).toBeFocused()
    }
    const first = page.locator('[data-room-hotspot="arc-sofa"]')
    const second = page.locator('[data-room-hotspot="dune-table"]')
    await first.click()
    await second.click()
    await expect(
      page.locator('[data-room-hotspot][aria-expanded="true"]'),
    ).toHaveCount(1)
    await expect(panel.locator('h3')).toHaveText('DUNE Travertine Coffee Table')
    await panel.getByRole('button', { name: 'Close product panel' }).click()
    await expect(second).toBeFocused()
    await first.click()
    await page.locator('#shop-room-title').click()
    await expect(panel).toBeHidden()
    await expect(first).toBeFocused()
    await first.click()
    await page.locator('#room-width').click()
    await expect(panel).toBeHidden()
    await expect(page.locator('#room-width')).toBeFocused()
    await first.press('Enter')
    await page.keyboard.press('Shift+Tab')
    await expect(first).toBeFocused()
    await expect(panel).toBeHidden()
    await first.press('Enter')
    await page.keyboard.press('Tab')
    await expect(
      panel.getByRole('link', { name: 'View product' }),
    ).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(panel).toBeHidden()
    await first.click()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (await panel.isHidden()) await first.click()
    await expect(panel).toBeVisible()
    await page.locator('.shop-the-room').screenshot({
      path: `test-results/shop-room-${width}.png`,
    })
  })
}

test('mobile room list exposes every matching product without hotspots or overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 })
  await page.goto('/?page=inspiration')
  await expect(page.locator('.room-mobile-list')).toBeVisible()
  await expect(page.locator('.room-mobile-list li')).toHaveCount(4)
  await expect(page.locator('.room-hotspot:visible')).toHaveCount(0)
  for (const item of shopRoom.items) {
    const product = products.find((product) => product.id === item.id)
    const link = page.locator(`[data-room-link="${item.id}"]`)
    await link.click()
    await expect(page.locator('h1')).toHaveText(product.name)
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'src',
      product.image,
    )
    await page.goBack()
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.locator('.shop-room-photo').evaluate((image) => {
    image.loading = 'eager'
    return image.decode()
  })
  await page.locator('.shop-the-room').screenshot({
    path: 'test-results/shop-room-360.png',
  })
})

test('reduced motion stops hotspot pulses and a mobile resize closes the panel accessibly', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?page=inspiration')
  const trigger = page.locator('[data-room-hotspot="arc-sofa"]')
  expect(
    await trigger.evaluate(
      (button) => getComputedStyle(button, '::before').animationName,
    ),
  ).toBe('none')
  await trigger.click()
  await page.setViewportSize({ width: 360, height: 900 })
  await expect(page.locator('#shop-room-panel')).toBeHidden()
  await expect(page.locator('[data-room-link="arc-sofa"]')).toBeFocused()
})
