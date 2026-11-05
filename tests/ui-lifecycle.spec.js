import { test, expect } from '@playwright/test'
import { products } from '../src/data.ts'
import { serializeProducts } from '../src/modules/products/products.api.ts'

const items = serializeProducts(products)

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('an earlier catalogue visit cannot overwrite a newer visit', async ({
  page,
}) => {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  let requests = 0
  let finishOld
  const oldFinished = new Promise((resolve) => {
    finishOld = resolve
  })
  await page.route('**/api/products', async (route) => {
    const visit = ++requests
    if (visit === 1) await gate
    await route.fulfill({
      json: {
        items: [
          {
            ...items[0],
            name: visit === 1 ? 'Old response' : 'Current response',
          },
        ],
      },
    })
    if (visit === 1) finishOld()
  })
  await page.goto('/?page=products')
  await expect(page.locator('#catalog-grid')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  await page.locator('a[data-page="about"]').first().click()
  await page.locator('a[data-page="products"]').first().click()
  await expect(page.locator('#catalog-grid h3')).toHaveText('Current response')
  release()
  await oldFinished
  // Wait for the old fetch and its promise continuation to complete in the browser.
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#catalog-grid h3')).toHaveText('Current response')
  expect(requests).toBe(2)
})

test('reinitializing and revisiting routes registers cart actions only once', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const { initializeUI } = await import('/src/ui.ts')
    const { products } = await import('/src/data.ts')
    const { loadProducts } =
      await import('/src/modules/products/products.client.ts')
    const { selectProducts } =
      await import('/src/modules/products/products.logic.ts')
    const { calculateCart } = await import('/src/modules/cart/cart.logic.ts')
    const { calculateRoomArea } =
      await import('/src/modules/rooms/rooms.logic.ts')
    const state = await import('/src/state.ts')
    initializeUI({
      products,
      loadProducts,
      selectProducts,
      calculateCart,
      calculateRoomArea,
      ...state,
    })
  })
  for (let visit = 0; visit < 3; visit++) {
    await page.locator('a[data-page="about"]').first().click()
    await page.locator('a[data-page="home"]').first().click()
  }
  await page.locator('#page-view button[data-product]').first().click()
  await expect(page.locator('#cart-count')).toHaveText('1')
  await page.locator('.cart-toggle').click()
  await page.locator('#cart-items button[data-action="increase"]').click()
  await expect(page.locator('#cart-count')).toHaveText('2')
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('2')
})
