import { products } from '../../data.ts'
import type {
  Cart,
  CartItem,
  CartLine,
  CartSummary,
  ResolvedCartItem,
} from './cart.types.ts'

const catalog = new Map(products.map((product) => [product.id, product]))
export const cartKey = (productId: string, variantId: string): string =>
  productId + '::' + variantId

export function resolveCartItem(entry: unknown): ResolvedCartItem | null {
  if (
    !isRecord(entry) ||
    typeof entry.productId !== 'string' ||
    typeof entry.variantId !== 'string'
  )
    return null
  const product = catalog.get(entry.productId)
  if (!product) return null
  const variant = product.variants.find(
    (option) => option.id === entry.variantId,
  )
  return variant?.available ? { product, variant } : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeCart(saved: unknown): Cart {
  const entries: Cart = new Map()
  if (!Array.isArray(saved)) return entries
  for (const entry of saved) {
    if (
      !isRecord(entry) ||
      typeof entry.productId !== 'string' ||
      typeof entry.variantId !== 'string' ||
      typeof entry.quantity !== 'number' ||
      !resolveCartItem(entry) ||
      !Number.isSafeInteger(entry.quantity) ||
      entry.quantity < 1
    )
      continue
    const key = cartKey(entry.productId, entry.variantId)
    const quantity = (entries.get(key)?.quantity || 0) + entry.quantity
    if (!Number.isSafeInteger(quantity)) continue
    entries.set(key, {
      productId: entry.productId,
      variantId: entry.variantId,
      quantity,
    })
  }
  return entries
}

export function calculateCart(entries: Iterable<CartItem>): CartSummary {
  const items: CartLine[] = []
  let quantity = 0
  let subtotal = 0
  for (const entry of entries) {
    const resolved = resolveCartItem(entry)
    if (!resolved) continue
    const total = resolved.variant.price * entry.quantity
    items.push({
      ...resolved,
      key: cartKey(entry.productId, entry.variantId),
      quantity: entry.quantity,
      total,
    })
    quantity += entry.quantity
    subtotal += total
  }
  return { items, quantity, subtotal }
}
