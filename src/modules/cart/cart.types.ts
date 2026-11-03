import type { Product, ProductVariant } from '../products/products.types.ts'

export interface CartItem {
  productId: string
  variantId: string
  quantity: number
}

export type Cart = Map<string, CartItem>
export type CartAction = 'remove' | 'increase' | 'decrease'

export interface ResolvedCartItem {
  product: Product
  variant: ProductVariant
}

export interface CartLine extends ResolvedCartItem {
  key: string
  quantity: number
  total: number
}

export interface CartSummary {
  items: CartLine[]
  quantity: number
  subtotal: number
}
