import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { products, rooms } from '../src/data/catalog.js'
import { heroSlides } from '../src/data/hero-slides.js'
import { shopRoom } from '../src/data/shop-room.js'
import {
  homeHero,
  aboutMaterials,
  aboutCraft,
} from '../src/data/page-imagery.js'
import { getProductGallery } from '../src/product-gallery.js'

test('decorative photographs have distinct owners and file contents', () => {
  const photos = [
    homeHero,
    aboutMaterials,
    aboutCraft,
    ...rooms,
    ...heroSlides.map((slide) => slide.room),
    shopRoom,
  ]
  expect(new Set(photos.map((photo) => photo.image)).size).toBe(photos.length)
  const hashes = photos.map((photo) =>
    crypto
      .createHash('sha256')
      .update(fs.readFileSync('public' + photo.image))
      .digest('hex'),
  )
  expect(new Set(hashes).size).toBe(photos.length)
  expect(rooms.some((room) => room.categories.includes('bathroom'))).toBe(true)
})

test('product galleries belong to one product and photographed finish', () => {
  const paths = []
  for (const product of products) {
    const views = getProductGallery(product, product.variants[0])
    expect(views.map((view) => view.id)).toEqual([
      'product',
      'angle',
      'detail',
      'lifestyle',
    ])
    for (const view of views.slice(1)) {
      expect(fs.existsSync('public' + view.image)).toBe(true)
      expect(view.alt).toContain(product.name)
      paths.push(view.image)
    }
    for (const variant of product.variants.slice(1)) {
      expect(
        getProductGallery(product, variant).map((view) => view.image),
      ).toEqual([variant.image])
    }
  }
  expect(new Set(paths).size).toBe(paths.length)
})

test('changing finish resets the gallery and offers an honest route back', async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('raha-entrance-seen', '1'),
  )
  const product = products[0]
  const [original, alternative] = product.variants
  await page.goto('/?page=product&id=' + product.id)
  await page.locator('[data-gallery=lifestyle]').click()
  await expect(page.locator('[data-gallery=lifestyle]')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.locator(`[data-color="${alternative.id}"]`).click()
  await expect(page.locator('#gallery-image')).toHaveAttribute(
    'src',
    alternative.image,
  )
  await expect(page.locator('[data-gallery]')).toHaveCount(1)
  await page.getByRole('link', { name: 'View those photographs' }).click()
  await expect(page.locator('#selected-color strong')).toHaveText(original.name)
  await expect(page.locator('[data-gallery]')).toHaveCount(4)
})
