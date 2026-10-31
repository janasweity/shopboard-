import { cartKey, normalizeCart, resolveCartItem } from './logic.js'

export const CART_STORAGE_KEY = 'raha-cart'

export function claimEntranceSession(replay = false) {
  const key = 'raha-entrance-seen'
  try {
    if (!replay && sessionStorage.getItem(key)) return false
    sessionStorage.setItem(key, '1')
    return true
  } catch {
    return false
  }
}

function restoreCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)))
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

export const getCart = () => [...cart.values()].map((entry) => ({ ...entry }))

export function addCartItem(productId, variantId) {
  if (!resolveCartItem({ productId, variantId })) return
  const key = cartKey(productId, variantId)
  const quantity = (cart.get(key)?.quantity || 0) + 1
  if (!Number.isSafeInteger(quantity)) return
  cart.set(key, { productId, variantId, quantity })
  saveCart()
}

export function changeCartItem(key, action) {
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
