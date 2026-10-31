import { test, expect } from '@playwright/test'
import { access } from 'node:fs/promises'
import { products, categories, retiredProducts } from '../src/data/catalog.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('five categories contain twelve distinct products each, with complete photographed finishes', async () => {
  expect(categories.slice(1).map(([, name]) => name)).toEqual([
    'Living Room',
    'Kitchen & Dining',
    'Bedroom',
    'Bathroom',
    'Home Decor',
  ])
  expect(products).toHaveLength(60)
  expect(new Set(products.map((product) => product.id)).size).toBe(60)
  expect(new Set(products.map((product) => product.image)).size).toBe(60)
  for (const [id] of categories.slice(1))
    expect(products.filter((product) => product.category === id)).toHaveLength(
      12,
    )
  for (const product of products) {
    expect(product.description.length).toBeGreaterThan(50)
    expect(product.dimensions).toBeTruthy()
    expect(product.materials).toBeTruthy()
    expect(product.variants.length).toBeGreaterThan(0)
    expect(product.image).toBe(product.variants[0].image)
    for (const variant of product.variants) {
      expect(variant.name).toBeTruthy()
      expect(variant.alt.length).toBeGreaterThan(20)
      expect(variant.price).toBeGreaterThan(0)
      expect(variant.hex).toMatch(/^#[0-9a-f]{6}$/i)
      await access(new URL('../public' + variant.image, import.meta.url))
    }
  }
})

test('all product and color photographs decode at a consistent size', async ({
  page,
}) => {
  await page.goto('/?page=products')
  const paths = [
    ...new Set(
      products.flatMap((product) =>
        product.variants.map((variant) => variant.image),
      ),
    ),
  ]
  const dimensions = []
  for (let start = 0; start < paths.length; start += 6) {
    dimensions.push(
      ...(await page.evaluate(
        async (paths) =>
          Promise.all(
            paths.map(async (src) => {
              const image = new Image()
              image.src = src
              await image.decode()
              return [src, image.naturalWidth, image.naturalHeight]
            }),
          ),
        paths.slice(start, start + 6),
      )),
    )
  }
  for (const [src, width, height] of dimensions)
    expect([width, height], src).toEqual([1536, 1024])
})

test('all five category selections work with mixed-case search, both price directions and reload', async ({
  page,
}) => {
  await page.goto('/?page=products')
  for (const [id] of categories.slice(1)) {
    await page.locator('#product-search').fill('')
    await page.locator('#category-filter').selectOption(id)
    await expect(page.locator('#catalog-grid article')).toHaveCount(12)
    const first = products.find((product) => product.category === id)
    await page
      .locator('#product-search')
      .fill(first.name.slice(0, 3).toLowerCase())
    await page.locator('#price-sort').selectOption('price-desc')
    await page.locator('#price-sort').selectOption('price-asc')
    await page.reload()
    await expect(page.locator('#category-filter')).toHaveValue(id)
    await expect(page.locator('#catalog-grid article').first()).toHaveAttribute(
      'data-id',
      first.id,
    )
  }
})

test('six homepage features cover all five categories and link to matching details', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('#products article')
  const ids = await cards.evaluateAll((cards) =>
    cards.map((card) => card.dataset.id),
  )
  expect(ids).toHaveLength(6)
  expect(
    new Set(
      ids.map((id) => products.find((product) => product.id === id).category),
    ).size,
  ).toBe(5)
  for (const id of ids) {
    await page.locator(`#products [data-id="${id}"] .product-image`).click()
    await expect(page.locator('h1')).toHaveText(
      products.find((product) => product.id === id).name,
    )
    await page.goBack()
  }
})

test('retired repetitive products recover into a relevant filtered catalogue', async ({
  page,
}) => {
  for (const id of ['butter-sofa', 'terra-serving-bowls', 'glaze-lamp']) {
    await page.goto('/?page=product&id=' + id)
    await expect(page).toHaveURL(/page=products/)
    await expect(page.locator('#category-filter')).toHaveValue(
      retiredProducts[id],
    )
    await expect(page.locator('#catalog-grid article')).toHaveCount(12)
  }
})
