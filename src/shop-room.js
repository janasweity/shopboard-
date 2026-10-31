import { products, money, productURL } from './data/catalog.js'

let activeHotspot = null
let pointerInteraction = false
const panel = () => document.querySelector('#shop-room-panel')

export function closeShopRoom(restoreFocus = true) {
  const trigger = activeHotspot
  const current = panel()
  if (current) current.hidden = true
  activeHotspot = null
  document
    .querySelectorAll('[data-room-hotspot]')
    .forEach((button) => button.setAttribute('aria-expanded', 'false'))
  if (restoreFocus && trigger?.isConnected && trigger.getClientRects().length) {
    trigger.focus({ preventScroll: true })
  }
}

function openShopRoom(trigger) {
  const current = panel()
  const product = products.find(
    (item) => item.id === trigger.dataset.roomHotspot,
  )
  const variant = product?.variants.find(
    (item) => item.id === trigger.dataset.roomColor,
  )
  if (!current || !product || !variant) return
  if (trigger === activeHotspot && !current.hidden) {
    closeShopRoom()
    return
  }
  closeShopRoom(false)
  activeHotspot = trigger
  const image = current.querySelector('img')
  image.src = variant.image
  image.alt = variant.alt
  current.querySelector('h3').textContent = product.name
  current.querySelector('.room-panel-color').textContent = variant.name
  current.querySelector('.room-panel-price').textContent = money(variant.price)
  current.querySelector('a').href =
    productURL(product.id) + '&color=' + encodeURIComponent(variant.id)
  current.hidden = false
  trigger.setAttribute('aria-expanded', 'true')
  current.querySelector('[data-room-close]').focus({ preventScroll: true })
}

export function initializeShopRoom() {
  document.addEventListener('pointerdown', () => {
    pointerInteraction = true
  })
  document.addEventListener('pointercancel', () => {
    pointerInteraction = false
  })
  document.addEventListener('click', (event) => {
    pointerInteraction = false
    const trigger = event.target.closest('button[data-room-hotspot]')
    if (trigger) {
      openShopRoom(trigger)
      return
    }
    const current = panel()
    if (!current || current.hidden) return
    if (event.target.closest('[data-room-close]')) closeShopRoom()
    else if (!current.contains(event.target)) {
      const focusable = event.target.closest(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      closeShopRoom(!focusable)
    }
  })
  document.addEventListener('keydown', (event) => {
    pointerInteraction = false
    const current = panel()
    if (
      event.key === 'Tab' &&
      event.shiftKey &&
      current &&
      !current.hidden &&
      document.activeElement === current.querySelector('[data-room-close]')
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
    // Let a pointer click finish before deciding whether focus should return.
    if (pointerInteraction) return
    const current = panel()
    if (
      current &&
      !current.hidden &&
      !current.contains(event.target) &&
      event.target !== activeHotspot
    )
      closeShopRoom(false)
  })
  window
    .matchMedia('(min-width: 768px)')
    .addEventListener('change', (event) => {
      const current = panel()
      if (event.matches || !current || current.hidden) return
      const id = activeHotspot?.dataset.roomHotspot
      closeShopRoom(false)
      if (id)
        document
          .querySelector(`[data-room-link="${id}"]`)
          ?.focus({ preventScroll: true })
    })
}
