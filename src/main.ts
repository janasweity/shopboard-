import './styles/tokens.css'
import './styles/main.css'
import { products } from './data.ts'
import { loadProducts } from './modules/products/products.client.ts'
import { selectProducts } from './modules/products/products.logic.ts'
import { calculateCart } from './modules/cart/cart.logic.ts'
import { calculateRoomArea } from './modules/rooms/rooms.logic.ts'
import {
  getCart,
  addCartItem,
  changeCartItem,
  clearCart,
  claimEntranceSession,
} from './state.ts'
import { initializeUI } from './ui.ts'

initializeUI({
  products,
  loadProducts,
  selectProducts,
  calculateCart,
  calculateRoomArea,
  getCart,
  addCartItem,
  changeCartItem,
  clearCart,
  claimEntranceSession,
})
