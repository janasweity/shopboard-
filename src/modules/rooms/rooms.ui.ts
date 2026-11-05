import {
  findElement,
  requireElement,
  findElements,
} from '../../shared/ui/dom.ts'
import type { UIDependencies } from '../../shared/ui/app.types.ts'
import { money, productURL } from '../../data.ts'

export function initializeRooms({
  products,
  calculateRoomArea,
}: Pick<UIDependencies, 'products' | 'calculateRoomArea'>) {
  const state: {
    activeHotspot: HTMLButtonElement | null
    pointerInteraction: boolean
  } = { activeHotspot: null, pointerInteraction: false }
  const panel = () => findElement('#shop-room-panel', HTMLElement)

  function closeShopRoom(restoreFocus = true) {
    const trigger = state.activeHotspot
    const current = panel()
    if (current) current.hidden = true
    state.activeHotspot = null
    findElements('[data-room-hotspot]', HTMLElement).forEach((button) =>
      button.setAttribute('aria-expanded', 'false'),
    )
    if (
      restoreFocus &&
      trigger?.isConnected &&
      trigger.getClientRects().length
    ) {
      trigger.focus({ preventScroll: true })
    }
  }

  function openShopRoom(trigger: HTMLButtonElement) {
    const current = panel()
    const product = products.find(
      (item) => item.id === trigger.dataset.roomHotspot,
    )
    const variant = product?.variants.find(
      (item) => item.id === trigger.dataset.roomColor,
    )
    if (!current || !product || !variant) return
    if (trigger === state.activeHotspot && !current.hidden) {
      closeShopRoom()
      return
    }
    closeShopRoom(false)
    state.activeHotspot = trigger
    const image = requireElement('img', HTMLImageElement, current)
    image.src = variant.image
    image.alt = variant.alt
    requireElement('h3', HTMLElement, current).textContent = product.name
    requireElement('.room-panel-color', HTMLElement, current).textContent =
      variant.name
    requireElement('.room-panel-price', HTMLElement, current).textContent =
      money(variant.price)
    requireElement('a', HTMLAnchorElement, current).href =
      productURL(product.id) + '&color=' + encodeURIComponent(variant.id)
    current.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    requireElement('[data-room-close]', HTMLButtonElement, current).focus({
      preventScroll: true,
    })
  }

  function initializeShopRoom() {
    document.addEventListener('pointerdown', () => {
      state.pointerInteraction = true
    })
    document.addEventListener('pointercancel', () => {
      state.pointerInteraction = false
    })
    document.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      state.pointerInteraction = false
      const trigger = target.closest<HTMLButtonElement>(
        'button[data-room-hotspot]',
      )
      if (trigger) {
        openShopRoom(trigger)
        return
      }
      const current = panel()
      if (!current || current.hidden) return
      if (target.closest('[data-room-close]')) closeShopRoom()
      else if (!current.contains(target)) {
        const focusable = target.closest(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        closeShopRoom(!focusable)
      }
    })
    document.addEventListener('keydown', (event) => {
      state.pointerInteraction = false
      const current = panel()
      if (
        event.key === 'Tab' &&
        event.shiftKey &&
        current &&
        !current.hidden &&
        document.activeElement ===
          requireElement('[data-room-close]', HTMLButtonElement, current)
      ) {
        event.preventDefault()
        closeShopRoom()
        return
      }
      if (event.key === 'Escape' && current && !current.hidden) {
        event.preventDefault()
        closeShopRoom()
      }
    })
    // This is a non-modal panel: Tab may leave it, without trapping focus.
    document.addEventListener('focusin', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      // Let a pointer click finish before deciding whether focus should return.
      if (state.pointerInteraction) return
      const current = panel()
      if (
        current &&
        !current.hidden &&
        !current.contains(target) &&
        target !== state.activeHotspot
      )
        closeShopRoom(false)
    })
    window
      .matchMedia('(min-width: 768px)')
      .addEventListener('change', (event) => {
        const current = panel()
        if (event.matches || !current || current.hidden) return
        const id = state.activeHotspot?.dataset.roomHotspot
        closeShopRoom(false)
        if (id)
          findElement(`[data-room-link="${id}"]`, HTMLAnchorElement)?.focus({
            preventScroll: true,
          })
      })
  }

  const view = requireElement('#page-view', HTMLElement)
  view.addEventListener('submit', (event) => {
    const target = event.target
    if (!(target instanceof HTMLFormElement)) return
    if (target.id === 'room-planner') {
      event.preventDefault()
      const area = calculateRoomArea(
        requireElement('#room-width', HTMLInputElement).valueAsNumber,
        requireElement('#room-length', HTMLInputElement).valueAsNumber,
      )
      requireElement('#room-area', HTMLElement).textContent =
        `Your room is ${area.toLocaleString('en-US', { maximumFractionDigits: 2 })} m². A good starting point for your layout.`
    }
  })
  initializeShopRoom()
  return { close: () => closeShopRoom(false) }
}
