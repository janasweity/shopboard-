import {
  cartKey,
  normalizeCart,
  resolveCartItem,
} from './modules/cart/cart.logic.ts'
import type { Cart, CartAction, CartItem } from './modules/cart/cart.types.ts'

export const CART_STORAGE_KEY = 'raha-cart'

export { claimEntranceSession } from './modules/state/session.ts'

function restoreCart(): Cart {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (saved === null) return new Map()
    const parsed: unknown = JSON.parse(saved)
    return normalizeCart(parsed)
  } catch {
    return new Map()
  }
}

// Restore before consumers can render; startup never saves an empty cart.
const cart = restoreCart()

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...cart.values()]))
  } catch {
    // Keep the cart usable in memory when browser storage is unavailable.
  }
}

export const getCart = (): CartItem[] =>
  [...cart.values()].map((entry) => ({ ...entry }))

export function addCartItem(productId: string, variantId: string): void {
  if (!resolveCartItem({ productId, variantId })) return
  const key = cartKey(productId, variantId)
  const quantity = (cart.get(key)?.quantity || 0) + 1
  if (!Number.isSafeInteger(quantity)) return
  cart.set(key, { productId, variantId, quantity })
  saveCart()
}

export function changeCartItem(key: string, action: CartAction): void {
  const entry = cart.get(key)
  if (!entry || !['remove', 'increase', 'decrease'].includes(action)) return
  if (action === 'remove' || (action === 'decrease' && entry.quantity === 1))
    cart.delete(key)
  else {
    const quantity = entry.quantity + (action === 'increase' ? 1 : -1)
    if (!Number.isSafeInteger(quantity)) return
    entry.quantity = quantity
  }
  saveCart()
}

export function clearCart() {
  cart.clear()
  saveCart()
}
