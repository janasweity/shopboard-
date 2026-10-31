import { test, expect } from '@playwright/test'
import { products, money } from '../src/data/catalog.js'
const kitchenProducts = products.filter(
  (product) => product.category === 'kitchen-dining',
)

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('kitchen product records are complete and unique', () => {
  expect(kitchenProducts).toHaveLength(12)
  expect(products).toHaveLength(60)
  expect(new Set(products.map((product) => product.id)).size).toBe(
    products.length,
  )
  for (const product of kitchenProducts) {
    expect(product.category).toBe('kitchen-dining')
    expect(product.price).toBeGreaterThan(0)
    expect(product.description.length).toBeGreaterThan(50)
    expect(product.dimensions).toBeTruthy()
    expect(product.materials).toBeTruthy()
    expect(product.care).toBeTruthy()
    expect(new Set(product.variants.map((variant) => variant.image)).size).toBe(
      product.variants.length,
    )
  }
})

test('all kitchen details show matching images, native variant controls, care, and cart entries', async ({
  page,
}) => {
  test.setTimeout(120000)
  for (const product of kitchenProducts) {
    await page.goto('/?page=products&collection=kitchen-dining')
    await page.locator(`[data-id="${product.id}"] .product-image`).click()
    await expect(page.locator('h1')).toHaveText(product.name)
    await expect(page.locator('.detail-price')).toHaveText(money(product.price))
    await expect(page.locator('.specifications')).toContainText(product.care)
    await expect(page.locator('.color-swatch')).toHaveCount(
      product.variants.length,
    )
    for (const variant of product.variants) {
      await page.locator(`[data-color="${variant.id}"]`).click()
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'src',
        variant.image,
      )
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'alt',
        variant.alt,
      )
      await page.locator('#gallery-image').evaluate((image) => image.decode())
      await page.locator('.detail-add').click()
    }
    await page.locator('.cart-toggle').click()
    await expect(page.locator('.cart-item')).toHaveCount(
      product.variants.length,
    )
    for (const variant of product.variants) {
      await expect(
        page.locator(`.cart-item[data-variant-id="${variant.id}"] img`),
      ).toHaveAttribute('src', variant.image)
    }
    // Each catalogue iteration starts empty explicitly; navigation retains carts.
    for (const variant of product.variants) {
      await page
        .locator(
          `.cart-item[data-variant-id="${variant.id}"] [data-action="remove"]`,
        )
        .click()
    }
    await page.getByRole('button', { name: 'Close cart', exact: true }).click()
    await expect(page.locator('[data-gallery]')).toHaveCount(1)
  }
})
