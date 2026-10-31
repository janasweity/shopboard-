import './styles/tokens.css'
import './styles/main.css'
import { products } from './data.js'
import { selectProducts, calculateCart, calculateRoomArea } from './logic.js'
import {
  getCart,
  addCartItem,
  changeCartItem,
  claimEntranceSession,
} from './state.js'
import { initializeUI } from './ui.js'

initializeUI({
  products,
  selectProducts,
  calculateCart,
  calculateRoomArea,
  getCart,
  addCartItem,
  changeCartItem,
  claimEntranceSession,
})
