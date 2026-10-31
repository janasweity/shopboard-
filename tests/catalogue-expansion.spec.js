import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { products, money } from '../src/data/catalog.js'
import { expandedProducts } from '../src/data/expanded-products.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('all forty existing designs and their original finish records remain available', async () => {
  const baseline = JSON.parse(
    await readFile(
      new URL('../scripts/catalogue-expansion-baseline.json', import.meta.url),
      'utf8',
    ),
  )
  expect(baseline).toHaveLength(40)
  for (const old of baseline) {
    const current = products.find((product) => product.id === old.id)
    expect(current?.name).toBe(old.name)
    expect(current?.category).toBe(old.category)
    for (const oldVariant of old.variants) {
      const currentVariant = current.variants.find(
        (variant) => variant.id === oldVariant.id,
      )
      expect(currentVariant).toMatchObject(oldVariant)
    }
  }
  const oldIds = new Set(baseline.map((product) => product.id))
  const newProducts = products.filter((product) => !oldIds.has(product.id))
  expect(newProducts).toHaveLength(20)
  expect(expandedProducts).toHaveLength(20)
  expect(new Set(products.map((product) => product.id)).size).toBe(60)
  expect(new Set(products.map((product) => product.name)).size).toBe(60)
  for (const category of [
    'living-room',
    'kitchen-dining',
    'bedroom',
    'bathroom',
    'home-decor',
  ])
    expect(
      newProducts.filter((product) => product.category === category),
    ).toHaveLength(4)
})

test('photographed finishes have distinct image files, readable names and unique identifiers', () => {
  for (const product of products) {
    expect(product.variants.length, product.id).toBeGreaterThanOrEqual(4)
    expect(product.variants.length, product.id).toBeLessThanOrEqual(6)
    expect(
      product.variants.filter((variant) => variant.available).length,
      product.id,
    ).toBeGreaterThanOrEqual(4)
    expect(new Set(product.variants.map((variant) => variant.id)).size).toBe(
      product.variants.length,
    )
    expect(new Set(product.variants.map((variant) => variant.image)).size).toBe(
      product.variants.length,
    )
    for (const variant of product.variants)
      expect(variant.name.trim().length).toBeGreaterThan(2)
  }
})

for (const product of products) {
  test(`${product.id}: every photographed finish switches and stays separate in the cart`, async ({
    page,
  }) => {
    await page.goto('/?page=product&id=' + product.id)
    await expect(page.locator('.color-options')).toBeVisible()
    const imageBottom = await page
      .locator('.product-gallery > figure')
      .boundingBox()
    const controls = await page.locator('.color-options').boundingBox()
    expect(controls.y).toBeGreaterThanOrEqual(
      imageBottom.y + imageBottom.height,
    )
    let total = 0
    for (const variant of product.variants) {
      const button = page.locator(`[data-color="${variant.id}"]`)
      await button.focus()
      await button.press('Space')
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(
        page.locator('[data-color][aria-pressed="true"]'),
      ).toHaveCount(1)
      await expect(page.locator('#selected-color strong')).toHaveText(
        variant.name,
      )
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'src',
        variant.image,
      )
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'alt',
        variant.alt,
      )
      await page.locator('#gallery-image').evaluate((image) => image.decode())
      expect(new URL(page.url()).searchParams.get('color')).toBe(variant.id)
      if (variant.available) {
        await page.locator('.detail-add').click()
        total += variant.price
      } else await expect(page.locator('.detail-add')).toBeDisabled()
    }
    await page.locator('.cart-toggle').click()
    await expect(page.locator('#cart-items .cart-item')).toHaveCount(
      product.variants.filter((variant) => variant.available).length,
    )
    for (const variant of product.variants.filter(
      (variant) => variant.available,
    )) {
      const entry = page.locator(
        `.cart-item[data-product-id="${product.id}"][data-variant-id="${variant.id}"]`,
      )
      await expect(entry.locator('.cart-color')).toHaveText(
        'Color / finish: ' + variant.name,
      )
      await expect(entry.locator('img')).toHaveAttribute('src', variant.image)
    }
    await expect(page.locator('#cart-total')).toHaveText(money(total))
    await page.getByRole('button', { name: 'Close cart', exact: true }).click()
    const available = product.variants.find((variant) => variant.available)
    await page.locator(`[data-color="${available.id}"]`).click()
    await page.locator('.detail-add').click()
    await page.locator('.cart-toggle').click()
    await expect(page.locator('#cart-total')).toHaveText(
      money(total + available.price),
    )
    await expect(page.locator('#cart-items .cart-item')).toHaveCount(
      product.variants.filter((variant) => variant.available).length,
    )
  })
}
