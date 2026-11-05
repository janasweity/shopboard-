import { fetchJson } from '../../shared/api/api-client.ts'
import type { Product } from './products.types.ts'
import type {
  ApiProduct,
  ApiVariant,
  ProductsResponse,
} from './products.api.types.ts'

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function strings(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === 'string')
}

function optionalStrings(value: Record<string, unknown>, keys: string[]) {
  return keys.every(
    (key) => value[key] === undefined || typeof value[key] === 'string',
  )
}

function cents(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function category(value: unknown): value is ApiProduct['category'] {
  return (
    value === 'living-room' ||
    value === 'kitchen-dining' ||
    value === 'bedroom' ||
    value === 'bathroom' ||
    value === 'home-decor'
  )
}

function variant(value: unknown): value is ApiVariant {
  return (
    record(value) &&
    strings(value, [
      'id',
      'name',
      'hex',
      'image',
      'alt',
      'availability',
      'materials',
      'description',
    ]) &&
    cents(value.price) &&
    typeof value.available === 'boolean' &&
    optionalStrings(value, ['photography'])
  )
}

function product(value: unknown): value is ApiProduct {
  return (
    record(value) &&
    strings(value, [
      'id',
      'name',
      'image',
      'alt',
      'description',
      'dimensions',
      'materials',
    ]) &&
    category(value.category) &&
    (value.collection === 'nature-form' ||
      value.collection === 'burgundy-butter' ||
      value.collection === 'kitchen-dining') &&
    cents(value.price) &&
    Array.isArray(value.variants) &&
    value.variants.length > 0 &&
    value.variants.every(variant) &&
    new Set(value.variants.map((item) => item.id)).size ===
      value.variants.length &&
    (value.categories === undefined ||
      (Array.isArray(value.categories) && value.categories.every(category))) &&
    optionalStrings(value, [
      'tag',
      'room',
      'care',
      'photography',
      'photoSubject',
      'photo',
      'finish',
      'hex',
    ])
  )
}

export function parseProductsResponse(value: unknown): ProductsResponse {
  if (
    !record(value) ||
    !Array.isArray(value.items) ||
    !value.items.every(product) ||
    new Set(value.items.map((item) => item.id)).size !== value.items.length
  ) {
    throw new Error('Invalid products response')
  }
  return { items: value.items }
}

export function mapApiProduct(item: ApiProduct): Product {
  const [first, ...rest] = item.variants
  const mapVariant = (variant: ApiVariant) => ({
    ...variant,
    price: variant.price / 100,
  })
  return {
    ...item,
    price: item.price / 100,
    variants: [mapVariant(first), ...rest.map(mapVariant)],
  }
}

export async function loadProducts(): Promise<Product[]> {
  const response = await fetchJson<ProductsResponse>(
    '/api/products',
    parseProductsResponse,
  )
  return response.items.map(mapApiProduct)
}
