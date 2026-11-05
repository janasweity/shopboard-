import { test, expect } from '@playwright/test'
import { products } from '../src/data.ts'

test('GET products returns the complete RAHA catalogue with prices in cents', async ({
  request,
}) => {
  const response = await request.get('/api/products')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/json')
  const body = await response.json()
  expect(Object.keys(body)).toEqual(['items'])
  const result = body.items
  expect(result).toEqual(
    products.map((product) => ({
      ...product,
      price: Math.round(product.price * 100),
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Math.round(variant.price * 100),
      })),
    })),
  )
  for (const product of result) {
    expect(Number.isSafeInteger(product.price)).toBe(true)
    for (const variant of product.variants) {
      expect(Number.isSafeInteger(variant.price)).toBe(true)
    }
  }
  expect(products[0].price).toBe(result[0].price / 100)
})

test('products route handles queries, rejects writes and leaves page routes intact', async ({
  request,
}) => {
  const response = await request.get('/api/products?check=json')
  expect(response.status()).toBe(200)
  expect((await response.json()).items).toHaveLength(products.length)
  const write = await request.post('/api/products', { data: {} })
  expect(write.status()).toBe(405)
  expect(write.headers().allow).toBe('GET')
  expect(await write.json()).toEqual({ error: 'Method not allowed' })
  const page = await request.get('/?page=products')
  expect(page.headers()['content-type']).toContain('text/html')
})
