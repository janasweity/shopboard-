import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { products, money } from '../src/data/catalog.js'
import { getProductGallery } from '../src/product-gallery.js'

// General storefront checks exercise the already-introduced session.
// Fresh-session branding, skip controls and reduced motion have dedicated tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
})

const pages = [
  ['home', '/'],
  ['products', '/?page=products'],
  ['product', '/?page=product&id=arc-sofa'],
  ['inspiration', '/?page=inspiration'],
  ['about', '/?page=about'],
]
async function decodeImages(page) {
  await page.locator('img').evaluateAll((images) =>
    Promise.all(
      images.map((image) => {
        image.loading = 'eager'
        return image.decode()
      }),
    ),
  )
}
for (const width of [360, 768, 1280]) {
  for (const [name, url] of pages) {
    test(`${name} layout, images and accessibility at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(url)
      await expect(page.locator('#page-view h1')).toHaveCount(1)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      expect(await page.locator('body').innerText()).not.toMatch(
        /[\u0600-\u06FF]/,
      )
      await expect(page.locator('html')).not.toHaveAttribute(
        'data-entrance',
        'playing',
      )
      await decodeImages(page)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      if (name === 'home' || name === 'products') {
        await expect(page.locator('.product-card')).toHaveCount(
          name === 'home' ? 6 : products.length,
        )
        expect(
          await page
            .locator('.product-grid')
            .first()
            .evaluate(
              (el) =>
                getComputedStyle(el).gridTemplateColumns.split(' ').length,
            ),
        ).toBe(width === 360 ? 1 : width === 768 ? 2 : 3)
      }
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
      expect(errors).toEqual([])
      await page.screenshot({
        path: `test-results/${name}-${width}.png`,
        fullPage: true,
      })
    })
  }
}

test('all product detail pages match their cards and load their product galleries', async ({
  page,
}) => {
  test.setTimeout(120000)
  for (const product of products) {
    await page.goto('/?page=products')
    await page.locator(`[data-id="${product.id}"] .product-image`).click()
    await expect(page).toHaveURL(new RegExp(`page=product&id=${product.id}$`))
    await expect(page.locator('h1')).toHaveText(product.name)
    await expect(page.locator('.detail-price')).toHaveText(money(product.price))
    await expect(page.locator('.specifications')).toContainText(
      product.dimensions,
    )
    await expect(page.locator('.specifications')).toContainText(
      product.materials,
    )
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'src',
      product.image,
    )
    for (const photo of getProductGallery(product, product.variants[0])) {
      await page.locator(`[data-gallery="${photo.id}"]`).click()
      await page.locator('#gallery-image').evaluate((image) => image.decode())
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'src',
        photo.image,
      )
      await expect(page.locator('#gallery-image')).toHaveAttribute(
        'alt',
        photo.alt,
      )
      await expect(page.locator('#gallery-caption')).toHaveText(photo.caption)
    }
    await page
      .getByRole('button', {
        name: `Show ${product.name} product photo`,
        exact: true,
      })
      .click()
    await page.locator('#gallery-image').evaluate((image) => image.decode())
    await expect(page.locator('#gallery-image')).toHaveAttribute(
      'src',
      product.image,
    )
  }
})

test('search, URL categories, reset, and browser history', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Products', exact: true })
    .click()
  await page.getByLabel('Category', { exact: true }).selectOption('bedroom')
  await expect(page.locator('.product-card:visible')).toHaveCount(12)
  await expect(page.getByLabel('Category', { exact: true })).toHaveValue(
    'bedroom',
  )
  await page.getByLabel('Find something for your home').fill('nOoK')
  await expect(page.locator('.product-card:visible')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.product-card:visible')).toHaveCount(1)
  await page.getByLabel('Find something for your home').fill('not a product')
  await expect(page.locator('#empty-products')).toBeVisible()
  await page.getByRole('button', { name: 'Reset search and filters' }).click()
  await expect(page.locator('.product-card:visible')).toHaveCount(
    products.length,
  )
  await page.locator('[data-id="arc-sofa"] .product-image').click()
  await page.goBack()
  await expect(page.locator('#product-search')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click()
  await expect(page.locator('.home-hero')).toBeVisible()
})

for (const id of products.map((product) => product.id)) {
  test(`${id} supports filtering, search, details, and the local cart`, async ({
    page,
  }) => {
    const product = products.find((item) => item.id === id)
    await page.goto('/?page=products')
    await expect(page.locator('#product-count')).toHaveText(
      `${products.length} of ${products.length} products`,
    )
    await page
      .getByLabel('Category', { exact: true })
      .selectOption(product.category)
    await page.getByLabel('Find something for your home').fill(product.name)
    await expect(page.locator('.product-card:visible')).toHaveCount(1)
    const card = page.locator(`[data-id="${id}"]`)
    await expect(card.locator('img')).toHaveAttribute('alt', product.alt)
    await card.locator('img').evaluate((image) => image.decode())
    await card
      .getByRole('button', { name: `Add ${product.name} to cart` })
      .click()
    await card.locator('.product-image').click()
    await expect(page.locator('h1')).toHaveText(product.name)
    await page
      .getByRole('button', { name: `Add ${product.name} to cart` })
      .click()
    await page.locator('.cart-toggle').click()
    await expect(page.locator('#cart-count')).toHaveText('2')
    await expect(page.locator('#cart-items')).toContainText(product.name)
    await page.locator('#cart-items img').evaluate((image) => image.decode())
    await expect(page.locator('#cart-total')).toHaveText(
      money(product.price * 2),
    )
    await page.getByRole('button', { name: `Remove ${product.name}` }).click()
    await expect(page.locator('#cart-count')).toHaveText('0')
  })
}

test('cart survives page navigation, supports quantity/removal, and persists on refresh', async ({
  page,
}) => {
  await page.goto('/')
  const sent = []
  page.on('request', (request) => {
    if (request.method() !== 'GET') sent.push(request.url())
  })
  await page
    .getByRole('button', { name: 'Add ARC Curved Sofa to cart', exact: true })
    .click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Products', exact: true })
    .click()
  await page
    .getByRole('button', {
      name: 'Add MOSS Olive Accent Chair to cart',
      exact: true,
    })
    .click()
  await expect(page.locator('#cart-count')).toHaveText('2')
  await page.locator('.cart-toggle').click()
  await expect(page.locator('#cart-total')).toHaveText('$2,190.00')
  await page
    .getByRole('button', { name: 'Increase ARC Curved Sofa quantity' })
    .click()
  await expect(page.locator('#cart-total')).toHaveText('$3,885.00')
  await page
    .getByRole('button', { name: 'Decrease ARC Curved Sofa quantity' })
    .click()
  await page
    .getByRole('button', { name: 'Remove MOSS Olive Accent Chair' })
    .click()
  await expect(page.locator('#cart-total')).toHaveText('$1,695.00')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.locator('.cart-toggle')).toBeFocused()
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('1')
  await page.locator('.cart-toggle').click()
  await expect(page.locator('#cart-total')).toHaveText('$1,695.00')
  expect(sent).toEqual([])
  expect(
    await page.evaluate(() => [
      localStorage.length,
      Object.keys(sessionStorage).filter((key) => key !== 'raha-entrance-seen')
        .length,
    ]),
  ).toEqual([1, 0])
})

test('registration and contact use native constraints and never send details', async ({
  page,
}) => {
  await page.goto('/?page=about')
  const sent = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() || request.method() !== 'GET')
      sent.push(request.url())
  })
  await page.getByRole('button', { name: 'Try contact demo' }).click()
  expect(
    await page
      .locator('#contact-form')
      .evaluate((form) => form.checkValidity()),
  ).toBe(false)
  await page.getByLabel('Your name', { exact: true }).fill('Demo Person')
  await page
    .getByLabel('Email address', { exact: true })
    .first()
    .fill('demo@example.com')
  await page.getByLabel("What's on your mind?").selectOption('Room planning')
  await page
    .getByLabel('Your message', { exact: true })
    .fill('This is a fictional demo enquiry.')
  await page.getByRole('button', { name: 'Try contact demo' }).click()
  await expect(page.locator('#contact-status')).toContainText(
    'No message was sent',
  )
  await expect(page.locator('#contact-message')).toHaveValue('')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click()
  const form = page.locator('.registration-form')
  await page.getByRole('button', { name: 'Try the demo', exact: true }).click()
  expect(await form.evaluate((form) => form.checkValidity())).toBe(false)
  await page.locator('#email').fill('demo@example.com')
  await page.locator('#password').fill('1234567')
  expect(await form.evaluate((form) => form.checkValidity())).toBe(false)
  await page.locator('#password').fill('demo-password')
  await page.getByRole('button', { name: 'Try the demo', exact: true }).click()
  await expect(page.locator('#registration-dialog')).not.toBeVisible()
  await expect(page.locator('#registration-status')).toContainText(
    'Successful demo validation only. No account was created',
  )
  await expect(page.locator('#registration-status')).toHaveAttribute(
    'role',
    'status',
  )
  await expect(page.locator('#password')).toHaveValue('')
  await page.getByRole('button', { name: 'Reopen demo form' }).click()
  await expect(page.locator('#email')).toBeFocused()
  expect(sent).toEqual([])
  expect(
    await page.evaluate(() => [
      localStorage.length,
      Object.keys(sessionStorage).filter((key) => key !== 'raha-entrance-seen')
        .length,
    ]),
  ).toEqual([0, 0])
})

test('keyboard navigation, room planner and invalid product recovery', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page
    .getByRole('navigation', { name: 'Store services' })
    .getByRole('link', { name: 'Planning tools' })
    .click()
  await page.getByLabel('Width (metres)').fill('4')
  await page.getByLabel('Length (metres)').fill('5')
  await page.getByRole('button', { name: 'Calculate room area' }).click()
  await expect(page.locator('#room-area')).toContainText('20 m²')
  await page.goto('/?page=product&id=missing')
  await expect(page.locator('h1')).toHaveText("We couldn't find that product.")
  await page.getByRole('link', { name: 'Explore the products' }).click()
  await expect(page.locator('.product-card')).toHaveCount(products.length)
})

test('retired collection links cannot add deleted products to the cart', async ({
  page,
}) => {
  for (const id of [
    'sofa',
    'chair',
    'table',
    'shelving',
    'lamp',
    'ceramics',
    'bed',
    'dining-table',
    'sideboard',
    'rug',
    'pendant',
    'vase',
    'leather-armchair',
    'floor-lamp',
  ]) {
    await page.goto(`/?page=product&id=${id}`)
    await expect(page.locator('h1')).toHaveText(
      "We couldn't find that product.",
    )
    await expect(page.locator('.detail-add')).toHaveCount(0)
    await expect(page.locator('#cart-count')).toHaveText('0')
  }
})

for (const width of [360, 768, 1280]) {
  test(`legacy collections remain visible selections and combine with search at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?page=products&collection=burgundy-butter')
    await expect(page.getByLabel('Category', { exact: true })).toHaveValue(
      'collection:burgundy-butter',
    )
    await expect(page.locator('#catalog-grid article')).toHaveCount(
      products.filter((product) => product.collection === 'burgundy-butter')
        .length,
    )
    await page.getByLabel('Find something for your home').fill('pLeAt')
    await expect(page.locator('#catalog-grid article')).toHaveCount(1)
    await page.getByLabel('Sort by price').selectOption('price-desc')
    await page.reload()
    await expect(page.getByLabel('Category', { exact: true })).toHaveValue(
      'collection:burgundy-butter',
    )
    await expect(page.locator('#price-sort')).toHaveValue('price-desc')
    await page.locator('[data-id="pleat-lamp"] .product-image').click()
    await expect(page.locator('h1')).toHaveText('PLEAT Blue Bedside Lamp')
    await page.goBack()
    await expect(page.locator('#product-search')).toHaveValue('pLeAt')
    await page
      .getByLabel('Category', { exact: true })
      .selectOption('collection:nature-form')
    await expect(page.locator('#empty-products')).toBeVisible()
    await page.getByRole('button', { name: 'Reset search and filters' }).click()
    await expect(page.locator('#catalog-grid article')).toHaveCount(
      products.length,
    )
    await decodeImages(page)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  })
}
