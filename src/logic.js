import { products } from './data.js'

export function selectProducts(
  source,
  { query = '', category = 'all', sort = 'default' } = {},
) {
  const search = query.trim().toLowerCase()
  const filtered = source.filter(
    (product) =>
      (category === 'all' ||
        category === product.category ||
        product.categories?.includes(category) ||
        category === 'collection:' + product.collection) &&
      product.name.toLowerCase().includes(search),
  )
  // Sorting a copy preserves both the source and the filtered order.
  const sorted = [...filtered]
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
  return sorted
}

export const calculateRoomArea = (width, length) => width * length

const catalog = new Map(products.map((product) => [product.id, product]))
export const cartKey = (productId, variantId) => productId + '::' + variantId

export function resolveCartItem(entry) {
  const product = catalog.get(entry?.productId)
  const variant = product?.variants.find(
    (option) => option.id === entry.variantId,
  )
  return variant?.available ? { product, variant } : null
}

export function normalizeCart(saved) {
  const entries = new Map()
  if (!Array.isArray(saved)) return entries
  for (const entry of saved) {
    if (
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

export function calculateCart(entries) {
  const items = []
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
