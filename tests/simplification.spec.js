import { test, expect } from '@playwright/test'
import { products } from '../src/data/catalog.js'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

test('Home has one hero, one featured grid, a separate room slider and five navigation items', async ({
  page,
}) => {
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(navigation.locator('li')).toHaveCount(5)
  await expect(navigation.getByRole('link')).toHaveText([
    'Home',
    'Products',
    'Room Inspiration',
    'About & Contact',
  ])
  await navigation.getByRole('button', { name: /Cart/ }).click()
  await expect(page.locator('#cart-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.hero')).toHaveCount(1)
  await expect(page.locator('#page-view .product-grid')).toHaveCount(1)
  await expect(page.locator('#products article')).toHaveCount(6)
  await expect(page.locator('#hero img')).not.toHaveAttribute(
    'src',
    await page.locator('.room-slider img').getAttribute('src'),
  )
  await page.getByRole('link', { name: 'View all products' }).click()
  await expect(page.locator('#catalog-grid article')).toHaveCount(
    products.length,
  )
  await expect(page.locator('#registration')).toBeHidden()
  await page.getByRole('link', { name: 'Try the registration demo' }).click()
  await expect(page.locator('#registration')).toBeVisible()
  await expect(page.locator('#registration')).toBeFocused()
})

for (const [url, selection] of [
  ['/?page=category&id=kitchen-dining', 'kitchen-dining'],
  ['/?page=lighting', 'living-room'],
  ['/?page=collection&id=burgundy-butter', 'collection:burgundy-butter'],
  ['/?page=burgundy-butter', 'collection:burgundy-butter'],
]) {
  test(`legacy route ${url} opens the shared filtered catalogue`, async ({
    page,
  }) => {
    await page.goto(url + '&q=lamp&sort=price-desc')
    await expect(page).toHaveURL(/page=products/)
    await expect(page.getByLabel('Category', { exact: true })).toHaveValue(
      selection,
    )
    await expect(page.locator('#product-search')).toHaveValue('lamp')
    await expect(page.locator('#price-sort')).toHaveValue('price-desc')
    const matches = products.filter(
      (product) =>
        (product.category === selection ||
          product.categories?.includes(selection) ||
          'collection:' + product.collection === selection) &&
        product.name.toLowerCase().includes('lamp'),
    )
    const expected = [...matches]
      .sort((a, b) => b.price - a.price)
      .map((product) => product.id)
    expect(
      await page
        .locator('#catalog-grid article')
        .evaluateAll((cards) => cards.map((card) => card.dataset.id)),
    ).toEqual(expected)
  })
}
