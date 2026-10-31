import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  products,
  categories,
  collections,
  money,
} from '../src/data/catalog.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

for (const width of [360, 768, 1280]) {
  test(`name search, category and both price directions stay combined at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?page=products')
    const search = page.getByLabel('Find something for your home', {
      exact: true,
    })
    const category = page.getByLabel('Category', { exact: true })
    const sort = page.getByLabel('Sort by price', { exact: true })
    const grid = page.locator('#catalog-grid')
    const ids = () =>
      grid
        .locator('article')
        .evaluateAll((cards) => cards.map((card) => card.dataset.id))
    await expect(page.locator('#page-view select')).toHaveCount(2)
    await expect(page.locator('#page-view [data-filter]')).toHaveCount(0)
    expect(
      await category
        .locator('option')
        .evaluateAll((options) => options.map((option) => option.value)),
    ).toEqual([
      ...categories.map(([id]) => id),
      ...collections.map(({ id }) => 'collection:' + id),
    ])
    await expect(category.locator('option').first()).toHaveText(
      'All categories',
    )
    const original = await page.evaluate(async () => {
      const { products } = await import('/src/data/catalog.js')
      Object.freeze(products)
      return products.map((product) => product.id)
    })
    const matches = products.filter(
      (product) =>
        product.category === 'living-room' &&
        product.name.toLowerCase().includes('a'),
    )
    expect(matches.length).toBeGreaterThanOrEqual(2)
    await category.selectOption('living-room')
    await search.fill('A')
    await sort.selectOption('price-asc')
    await expect(search).toHaveValue('A')
    await expect(category).toHaveValue('living-room')
    expect(await ids()).toEqual(
      [...matches]
        .sort((a, b) => a.price - b.price)
        .map((product) => product.id),
    )
    await expect(page.locator('#product-count')).toHaveText(
      `${matches.length} of ${products.length} products`,
    )
    await sort.selectOption('price-desc')
    expect(await ids()).toEqual(
      [...matches]
        .sort((a, b) => b.price - a.price)
        .map((product) => product.id),
    )
    await expect(search).toHaveValue('A')
    await expect(category).toHaveValue('living-room')
    await page.reload()
    await expect(sort).toHaveValue('price-desc')
    await expect(search).toHaveValue('A')
    await expect(category).toHaveValue('living-room')
    const first = [...matches].sort((a, b) => b.price - a.price)[0]
    await page
      .getByRole('button', { name: `Add ${first.name} to cart`, exact: true })
      .click()
    await expect(page.locator('#cart-count')).toHaveText('1')
    await page.locator('.cart-toggle').click()
    await expect(page.locator('#cart-total')).toHaveText(money(first.price))
    await page.getByRole('button', { name: 'Close cart', exact: true }).click()
    await grid.locator('article').first().locator('.product-image').click()
    await expect(page.locator('h1')).toHaveText(first.name)
    await page.goBack()
    await expect(sort).toHaveValue('price-desc')
    await expect(search).toHaveValue('A')
    await expect(category).toHaveValue('living-room')
    await sort.selectOption('default')
    expect(await ids()).toEqual(matches.map((product) => product.id))
    expect(
      await page.evaluate(async () =>
        (await import('/src/data/catalog.js')).products.map(
          (product) => product.id,
        ),
      ),
    ).toEqual(original)
    await search.fill('no matching product here')
    await expect(grid.locator('article')).toHaveCount(0)
    await expect(page.locator('#empty-products')).toContainText(
      'All categories',
    )
    await expect(page.locator('#product-count')).toHaveText(
      `0 of ${products.length} products`,
    )
    await expect(category).toHaveValue('living-room')
    await sort.selectOption('price-asc')
    await search.fill('A')
    await category.selectOption('all')
    await expect(sort).toHaveValue('price-asc')
    await expect(search).toHaveValue('A')
    await category.selectOption('collection:burgundy-butter')
    expect(await ids()).toEqual(
      products
        .filter(
          (product) =>
            product.collection === 'burgundy-butter' &&
            product.name.toLowerCase().includes('a'),
        )
        .sort((a, b) => a.price - b.price)
        .map((product) => product.id),
    )
    await page
      .getByRole('button', { name: 'Reset search and filters', exact: true })
      .click()
    await expect(category).toHaveValue('all')
    await expect(sort).toHaveValue('default')
    await expect(search).toHaveValue('')
    expect(await ids()).toEqual(products.map((product) => product.id))
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}

test('search uses product names rather than matching descriptions or materials', async ({
  page,
}) => {
  await page.goto('/?page=products')
  const product = products.find((product) =>
    product.materials.toLowerCase().includes('walnut'),
  )
  expect(product).toBeTruthy()
  await page.getByLabel('Find something for your home').fill('walnut')
  const expected = products.filter((product) =>
    product.name.toLowerCase().includes('walnut'),
  )
  await expect(page.locator('#catalog-grid article')).toHaveCount(
    expected.length,
  )
})
