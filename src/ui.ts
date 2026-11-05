import type { UIDependencies } from './shared/ui/app.types.ts'
import { initializeProducts } from './modules/products/products.ui.ts'
import { initializeGallery } from './modules/products/gallery.ui.ts'
import { initializeCart } from './modules/cart/cart.ui.ts'
import { initializeForms } from './modules/forms/forms.ui.ts'
import { initializeRooms } from './modules/rooms/rooms.ui.ts'
import { initializeEntrance } from './modules/interactions/entrance.ui.ts'
import { initializeHeroSlider } from './modules/interactions/slider.ui.ts'
import { initializeNavigation } from './modules/navigation/navigation.ui.ts'

let initialized = false

export function initializeUI(dependencies: UIDependencies): void {
  if (initialized) return
  initialized = true
  const products = initializeProducts(dependencies)
  initializeGallery(dependencies)
  const cart = initializeCart(dependencies)
  const forms = initializeForms()
  const rooms = initializeRooms(dependencies)
  const entrance = initializeEntrance(dependencies)
  initializeHeroSlider()
  initializeNavigation(
    () => {
      products.leave()
      rooms.close()
      entrance.stop()
    },
    (page, params) => {
      if (page === 'products') products.enter(params)
      forms.reset(page)
      cart.resetStatus()
    },
  )
  entrance.start()
}
