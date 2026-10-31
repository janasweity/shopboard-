import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { products, money } from '../src/data/catalog.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('RAHA branding and the ten named palette shades apply across all pages', async ({
  page,
  request,
}) => {
  for (const path of [
    '/',
    '/?page=products',
    '/?page=product&id=arc-sofa',
    '/?page=inspiration',
    '/?page=about',
  ]) {
    await page.goto(path)
    await expect(page).toHaveTitle(/RAHA$/)
    await expect(page.locator('.site-header .brand')).toHaveText(
      'RAHAHOME & LIVING',
    )
    await expect(page.locator('.footer-brand')).toHaveText('RAHAHOME & LIVING')
  }
  const palette = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    return [
      'soft-black',
      'charcoal-brown',
      'warm-slate',
      'graphite-grey',
      'stone-grey',
      'warm-greige',
      'taupe-brown',
      'silver-mist',
      'warm-ivory',
      'soft-white',
    ].map((name) => css.getPropertyValue('--' + name).trim())
  })
  expect(palette).toEqual([
    '#171614',
    '#302923',
    '#4d4b47',
    '#62605b',
    '#88857d',
    '#b6ac9d',
    '#9a826d',
    '#d1c8bc',
    '#eee5d5',
    '#faf8f1',
  ])
  const icon = await request.get('/raha.svg')
  expect(icon.ok()).toBe(true)
  expect(await icon.text()).toContain('RAHA')
})

for (const product of products.filter((item) => item.variants.length > 1)) {
  test(`${product.id}: matching color images, keyboard selection, and separate cart variants`, async ({
    page,
  }) => {
    const [original, alternative] = product.variants
    await page.goto(`/?page=product&id=${product.id}`)
    await expect(page.locator('.color-swatch')).toHaveCount(
      product.variants.length,
    )
    await expect(page.locator('#selected-color strong')).toHaveText(
      original.name,
    )
    await page.locator('#gallery-image').evaluate((image) => image.decode())
    await page.locator('.detail-add').click()
    if (!alternative) {
      await page.locator('.cart-toggle').click()
      await expect(page.locator('#cart-items .cart-color')).toContainText(
        original.name,
      )
      await expect(page.locator('#cart-total')).toHaveText(
        money(original.price),
      )
      return
    }
    const swatch = page.locator(`[data-color="${alternative.id}"]`)
    await swatch.focus()
    await swatch.press('Space')
    await expect(swatch).toHaveAttribute('aria-pressed', 'true')
    await expect(swatch).toBeFocused()
    await expect(
      page.locator('.color-swatch[aria-pressed="true"]'),
    ).toHaveCount(1)
    await expect(page.locator('#selected-color strong')).toHaveText(
      alternative.name,
    )
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'src',
      alternative.image,
    )
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'alt',
      alternative.alt,
    )
    await page.locator('#gallery-image').evaluate((image) => image.decode())
    expect(
      await page
        .locator('#gallery-image')
        .evaluate((image) => getComputedStyle(image).filter),
    ).toBe('none')
    await expect(page.locator('.detail-price')).toHaveText(
      money(alternative.price),
    )
    await expect(page.locator('#variant-availability')).toHaveText(
      alternative.availability,
    )
    await expect(page.locator('[data-gallery]')).toHaveCount(1)
    await page
      .getByRole('button', {
        name: `Show ${product.name} product photo`,
        exact: true,
      })
      .click()
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'src',
      alternative.image,
    )
    await page.reload()
    await expect(page.locator('#selected-color strong')).toHaveText(
      alternative.name,
    )
    if (!alternative.available) {
      await expect(page.locator('.detail-add')).toBeDisabled()
      await expect(page.locator('#cart-count')).toHaveText('1')
      await page.locator('[data-color="original"]').click()
      await expect(page.locator('.detail-add')).toBeEnabled()
      return
    }
    // Reload retains the original item and the chosen color in the URL.
    await page.locator('.detail-add').click()
    await page.locator('[data-color="original"]').click()
    await page.locator(`[data-color="${alternative.id}"]`).click()
    await page.locator('.detail-add').click()
    await page.locator('.cart-toggle').click()
    const lines = page.locator('#cart-items .cart-item')
    await expect(lines).toHaveCount(2)
    const first = page.locator('#cart-items [data-variant-id="original"]')
    const second = page.locator(
      `#cart-items [data-variant-id="${alternative.id}"]`,
    )
    await expect(first.locator('.cart-color')).toContainText(original.name)
    await expect(second.locator('.cart-color')).toContainText(alternative.name)
    await expect(second.locator('img')).toHaveAttribute(
      'src',
      alternative.image,
    )
    await expect(page.locator('#cart-total')).toHaveText(
      money(original.price + alternative.price * 2),
    )
    await first.locator('[data-action="increase"]').click()
    await expect(page.locator('#cart-total')).toHaveText(
      money(original.price * 2 + alternative.price * 2),
    )
    await first.locator('[data-action="remove"]').click()
    await expect(lines).toHaveCount(1)
    await expect(second.locator('.cart-color')).toContainText(alternative.name)
    await expect(page.locator('#cart-total')).toHaveText(
      money(alternative.price * 2),
    )
  })
}

for (const width of [360, 768, 1280]) {
  test(`swatches remain readable, accessible, and within the viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?page=product&id=arc-sofa&color=olive')
    await expect(page.locator('[data-color="olive"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `test-results/raha-colors-${width}.png`,
      fullPage: true,
    })
  })
}
