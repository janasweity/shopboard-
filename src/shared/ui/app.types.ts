import type { Product } from '../../modules/products/products.types.ts'
import type { loadProducts } from '../../modules/products/products.client.ts'
import type { selectProducts } from '../../modules/products/products.logic.ts'
import type { calculateCart } from '../../modules/cart/cart.logic.ts'
import type { calculateRoomArea } from '../../modules/rooms/rooms.logic.ts'
import type {
  getCart,
  addCartItem,
  changeCartItem,
  clearCart,
  claimEntranceSession,
} from '../../state.ts'

export interface UIDependencies {
  products: Product[]
  loadProducts: typeof loadProducts
  selectProducts: typeof selectProducts
  calculateCart: typeof calculateCart
  calculateRoomArea: typeof calculateRoomArea
  getCart: typeof getCart
  addCartItem: typeof addCartItem
  changeCartItem: typeof changeCartItem
  clearCart: typeof clearCart
  claimEntranceSession: typeof claimEntranceSession
}

export interface UIState {
  cleanup: () => void
  initialized: boolean
  activeHotspot: HTMLButtonElement | null
  pointerInteraction: boolean
}
