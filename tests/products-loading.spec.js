import { test, expect } from '@playwright/test'
import { products, money } from '../src/data.ts'
import { serializeProducts } from '../src/modules/products/products.api.ts'
import {
  parseProductsResponse,
  mapApiProduct,
} from '../src/modules/products/products.client.ts'

const items = serializeProducts(products)

test('runtime contract rejects malformed envelopes, prices, metadata and variants', () => {
  const badProduct = (change) => ({ items: [{ ...items[0], ...change }] })
  const invalid = [
    null,
    [],
    { items: null },
    { items: [null] },
    badProduct({ price: '100' }),
    badProduct({ price: -1 }),
    badProduct({ price: Number.MAX_SAFE_INTEGER + 1 }),
    badProduct({ category: 'unknown' }),
    badProduct({ collection: 'unknown' }),
    badProduct({ categories: ['unknown'] }),
    badProduct({ care: 42 }),
    badProduct({ image: null }),
    badProduct({ variants: [] }),
    badProduct({ variants: [{ ...items[0].variants[0], available: 'yes' }] }),
    badProduct({ variants: [{ ...items[0].variants[0], description: null }] }),
    badProduct({ variants: [items[0].variants[0], items[0].variants[0]] }),
    { items: [items[0], items[0]] },
  ]
  for (const value of invalid)
    expect(() => parseProductsResponse(value)).toThrow(
      'Invalid products response',
    )
  const input = structuredClone(items[0])
  input.price = 12345
  input.variants[0].price = 6789
  const mapped = mapApiProduct(
    parseProductsResponse({ items: [input] }).items[0],
  )
  expect(mapped.price).toBe(123.45)
  expect(mapped.variants[0].price).toBe(67.89)
  expect(input.price).toBe(12345)
  expect(input.variants[0].price).toBe(6789)
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('each Products visit fetches and renders the latest API response, including reload', async ({
  page,
}) => {
  let requests = 0
  await page.route('**/api/products', (route) => {
    requests++
    return route.fulfill({
      json: {
        items: [{ ...items[0], name: `API catalogue visit ${requests}` }],
      },
    })
  })
  await page.goto('/')
  await page.locator('a[data-page="products"]').first().click()
  await expect(page.locator('#catalog-grid h3')).toHaveText(
    'API catalogue visit 1',
  )
  await expect(page.locator('#catalog-grid article')).toHaveCount(1)
  await page.locator('a[data-page="home"]').first().click()
  await page.locator('a[data-page="products"]').first().click()
  await expect(page.locator('#catalog-grid h3')).toHaveText(
    'API catalogue visit 2',
  )
  await page.reload()
  await expect(page.locator('#catalog-grid h3')).toHaveText(
    'API catalogue visit 3',
  )
  expect(requests).toBe(3)
})

test('shows loading, renders fetched products in dollars, and retains filters across navigation', async ({
  page,
}) => {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/api/products', async (route) => {
    await gate
    await route.fulfill({
      json: { items: [{ ...items[0], name: 'Fetched RAHA sofa' }] },
    })
  })
  await page.goto('/?page=products')
  await expect(page.locator('#catalogue-status')).toHaveText(
    'Loading products…',
  )
  await expect(page.locator('#catalog-grid')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  await page.locator('#product-search').fill('FETCHED')
  release()
  await expect(page.locator('#catalog-grid article')).toHaveCount(1)
  await expect(page.locator('#catalog-grid h3')).toHaveText('Fetched RAHA sofa')
  await expect(page.locator('#catalog-grid .product-price')).toHaveText(
    money(products[0].price),
  )
  await page.locator('#product-search').fill('no such product')
  await expect(page.locator('#empty-products')).toBeVisible()
  await expect(page.locator('#catalogue-status')).toBeEmpty()
  await page.locator('#reset-filters').click()
  await page.locator('#catalog-grid [data-product]').click()
  await expect(page.locator('#cart-count')).toHaveText('1')
})

for (const failure of [
  'http',
  'network',
  'html',
  'json',
  'shape',
  'variant-price',
]) {
  test(`handles ${failure} failure and retries without losing filter input`, async ({
    page,
  }) => {
    let attempts = 0
    await page.route('**/api/products', async (route) => {
      attempts++
      if (attempts > 1) return route.fulfill({ json: { items } })
      if (failure === 'http')
        return route.fulfill({ status: 503, json: { error: 'Unavailable' } })
      if (failure === 'network') return route.abort()
      if (failure === 'html')
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><html><body>Vite fallback</body></html>',
        })
      if (failure === 'json')
        return route.fulfill({ contentType: 'application/json', body: '{' })
      if (failure === 'shape') return route.fulfill({ json: items })
      return route.fulfill({
        json: {
          items: [
            {
              ...items[0],
              variants: [{ ...items[0].variants[0], price: 1.5 }],
            },
          ],
        },
      })
    })
    await page.goto('/?page=products')
    await expect(
      page.getByRole('button', { name: 'Try again', exact: true }),
    ).toBeVisible()
    await expect(page.locator('#catalog-grid article')).toHaveCount(0)
    await expect(page.locator('#empty-products')).toBeHidden()
    await page.locator('#product-search').fill('sofa')
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(page.locator('#product-count')).toHaveText(
      `${products.filter((p) => p.name.toLowerCase().includes('sofa')).length} of ${products.length} products`,
    )
    await expect(page.locator('#product-search')).toHaveValue('sofa')
    expect(attempts).toBe(2)
  })
}

test('empty catalogue differs from no filter matches', async ({ page }) => {
  await page.route('**/api/products', (route) =>
    route.fulfill({ json: { items: [] } }),
  )
  await page.goto('/?page=products')
  await expect(page.locator('#catalogue-status')).toContainText(
    'The catalogue is empty',
  )
  await expect(page.locator('#empty-products')).toBeHidden()
  await expect(page.locator('#product-count')).toHaveText('0 of 0 products')
})

test('late response after navigating away does not replace the current page', async ({
  page,
}) => {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/api/products', async (route) => {
    await gate
    await route.fulfill({ json: { items } })
  })
  await page.goto('/?page=products')
  await page.locator('a[data-page="about"]').first().click()
  release()
  await expect(page.locator('#page-view h1')).toContainText(
    'Thoughtful design.',
  )
  await page.locator('a[data-page="products"]').first().click()
  await expect(page.locator('#catalog-grid article')).toHaveCount(
    products.length,
  )
})

test('fetchJson exposes HTTP status and mapper restores product and variant dollars', async ({
  page,
}) => {
  await page.goto('/')
  await page.route('**/api/test-error', (route) =>
    route.fulfill({ status: 418, body: 'not JSON' }),
  )
  const result = await page.evaluate(async () => {
    const { fetchJson, ApiError } =
      await import('/src/shared/api/api-client.ts')
    const { loadProducts } =
      await import('/src/modules/products/products.client.ts')
    let error
    try {
      await fetchJson('/api/test-error', (value) => value)
    } catch (caught) {
      error = { isApiError: caught instanceof ApiError, status: caught.status }
    }
    return { error, products: await loadProducts() }
  })
  expect(result.error).toEqual({ isApiError: true, status: 418 })
  expect(result.products).toEqual(products)
})
