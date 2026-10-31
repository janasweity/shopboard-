import { test, expect } from '@playwright/test'
import { products, money } from '../src/data/catalog.js'

const product = products[0]
const [first, second] = product.variants.filter((variant) => variant.available)
const other = products[1]
const otherVariant = other.variants.find((variant) => variant.available)
const storageKey = 'raha-cart'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('cart preserves colors, quantities, count and current prices through refresh, navigation and every mutation', async ({
  page,
}) => {
  await page.goto(`/?page=product&id=${product.id}&color=${first.id}`)
  await page.locator('.detail-add').click({ clickCount: 2 })
  await page.goto(`/?page=product&id=${other.id}&color=${otherVariant.id}`)
  await page.locator('.detail-add').click()
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('3')
  await page.locator('.cart-toggle').click()
  const row = page.locator(
    `.cart-item[data-product-id="${product.id}"][data-variant-id="${first.id}"]`,
  )
  await expect(row.locator('[aria-label^="Quantity:"]')).toHaveText('2')
  await expect(row.locator('.cart-color')).toHaveText(
    'Color / finish: ' + first.name,
  )
  await expect(page.locator('#cart-total')).toHaveText(
    money(first.price * 2 + otherVariant.price),
  )
  await page.keyboard.press('Escape')
  await page.goto(`/?page=product&id=${product.id}&color=${second.id}`)
  await page.locator('.detail-add').click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click()
  await page.reload()
  await page.locator('.cart-toggle').click()
  await expect(page.locator('.cart-item')).toHaveCount(3)
  await expect(page.locator('#cart-count')).toHaveText('4')
  await row.locator('[data-action="increase"]').click()
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('5')
  await page.locator('.cart-toggle').click()
  await row.locator('[data-action="decrease"]').click()
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('4')
  await page.locator('.cart-toggle').click()
  await row.locator('[data-action="remove"]').click()
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('2')
  await expect(page.locator('#cart-total')).toHaveText(
    money(second.price + otherVariant.price),
  )
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    storageKey,
  )
  expect(saved).toEqual([
    { productId: other.id, variantId: otherVariant.id, quantity: 1 },
    { productId: product.id, variantId: second.id, quantity: 1 },
  ])
  await page.evaluate(async () => (await import('/src/state.js')).clearCart())
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('0')
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      storageKey,
    ),
  ).toEqual([])
})

test('restore rejects corrupt entries and uses catalogue prices without rewriting saved data on startup', async ({
  page,
}) => {
  await page.goto('/')
  for (const saved of [
    '{broken json',
    JSON.stringify({ items: [] }),
    JSON.stringify([
      null,
      { productId: 'missing', variantId: first.id, quantity: 1 },
      { productId: product.id, variantId: 'missing', quantity: 1 },
      ...[0, -1, 1.5, '2', 1e100].map((quantity) => ({
        productId: product.id,
        variantId: first.id,
        quantity,
      })),
    ]),
  ]) {
    await page.evaluate(({ key, saved }) => localStorage.setItem(key, saved), {
      key: storageKey,
      saved,
    })
    await page.reload()
    await expect(page.locator('#cart-count')).toHaveText('0')
    expect(
      await page.evaluate((key) => localStorage.getItem(key), storageKey),
    ).toBe(saved)
  }
  await page.evaluate(
    ({ key, productId, variantId }) =>
      localStorage.setItem(
        key,
        JSON.stringify([
          { productId, variantId, quantity: 2, price: 0.01 },
          { productId, variantId, quantity: 1, price: 999999 },
          { productId: 'missing', variantId, quantity: 2 },
        ]),
      ),
    { key: storageKey, productId: product.id, variantId: first.id },
  )
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('3')
  await expect(page.locator('#cart-total')).toHaveText(money(first.price * 3))
  await page.locator('.cart-toggle').click()
  await expect(page.locator('.cart-item')).toHaveCount(1)
})

test('unavailable storage leaves a working in-memory cart', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked')
    }
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked')
    }
  })
  await page.goto(`/?page=product&id=${product.id}&color=${first.id}`)
  await page.locator('.detail-add').click()
  await expect(page.locator('#cart-count')).toHaveText('1')
  await page.locator('.cart-toggle').click()
  await page.locator('[data-action="remove"]').click()
  await expect(page.locator('#cart-count')).toHaveText('0')
})
