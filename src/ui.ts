import type { UIDependencies, UIState } from './shared/ui/app.types.ts'
import type {
  Product,
  ProductVariant,
} from './modules/products/products.types.ts'
import { isPriceSort } from './modules/products/products.logic.ts'
import { findElement, requireElement, findElements } from './shared/ui/dom.ts'
import {
  getVariant,
  categories,
  categoryAliases,
  retiredProducts,
  collections,
  money,
  productURL,
} from './data.ts'
import { heroSlides } from './data/hero-slides.ts'
import { getPage, card, galleryOptions } from './pages.ts'
import { getProductGallery } from './product-gallery.ts'

// Browser interactions are initialized once by main.ts.
export function initializeUI({
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
}: UIDependencies): void {
  // Entrance animation and cleanup.
  const state: UIState = {
    cleanup: () => {},
    initialized: false,
    activeHotspot: null,
    pointerInteraction: false,
  }
  function stopEntrance() {
    state.cleanup()
  }

  function startEntrance() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const url = new URL(location.href)
    const replay = url.searchParams.get('intro') === 'replay'
    if (replay) {
      url.searchParams.delete('intro')
      history.replaceState(null, '', url)
    }
    if (!claimEntranceSession(replay)) return
    if (reducedMotion.matches) return

    // Created only after the app renders. CSS never hides the underlying page.
    const intro = document.createElement('section')
    intro.className = 'store-intro'
    intro.setAttribute('aria-labelledby', 'intro-title')
    intro.innerHTML =
      '<div class="intro-brand"><p class="intro-kicker">MAKE ROOM FOR LIVING</p><p id="intro-title">RAHA<span>HOME &amp; LIVING</span></p><span class="intro-line" aria-hidden="true"></span></div><button type="button" class="skip-intro">Skip intro <span aria-hidden="true">↗</span></button>'
    const targets: [HTMLElement, string][] = []
    const mark = (
      element: HTMLElement | null,
      className: string,
      delay: number,
    ) => {
      if (!element) return
      element.classList.add(className)
      element.style.setProperty('--entrance-delay', `${delay}ms`)
      targets.push([element, className])
    }
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) stopEntrance()
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stopEntrance()
    }
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !intro.contains(event.target))
        stopEntrance()
    }
    const timer = window.setTimeout(stopEntrance, 3750)
    state.cleanup = () => {
      window.clearTimeout(timer)
      const restoreFocus = intro.contains(document.activeElement)
      targets.forEach(([element, className]) => {
        element.classList.remove(className)
        element.style.removeProperty('--entrance-delay')
      })
      intro.remove()
      delete document.documentElement.dataset.entrance
      reducedMotion.removeEventListener('change', onMotionChange)
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('focusin', onFocus)
      state.cleanup = () => {}
      if (restoreFocus)
        requireElement('#main-content', HTMLElement).focus({
          preventScroll: true,
        })
    }
    requireElement('.skip-intro', HTMLButtonElement, intro).addEventListener(
      'click',
      stopEntrance,
    )
    reducedMotion.addEventListener('change', onMotionChange)
    document.addEventListener('keydown', onEscape)
    mark(
      findElement('.home-hero figure > img', HTMLImageElement),
      'entrance-hero',
      2100,
    )
    mark(findElement('#page-view h1', HTMLElement), 'entrance-copy', 2350)
    mark(
      findElement('#page-view .search-field', HTMLElement),
      'entrance-search',
      2450,
    )
    findElements('#page-view .product-card', HTMLElement).forEach(
      (card, index) =>
        mark(card, 'entrance-card', 2550 + Math.min(index, 11) * 50),
    )
    document.documentElement.dataset.entrance = 'playing'
    document.body.append(intro)
    intro.classList.add('is-playing')
    requireElement('.skip-intro', HTMLButtonElement, intro).focus({
      preventScroll: true,
    })
    document.addEventListener('focusin', onFocus)
  }

  // Manual room slider.

  function initializeHeroSlider() {
    if (state.initialized) return
    state.initialized = true
    // Manual controls avoid unexpected motion and leave the visitor in control.
    document.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest<HTMLButtonElement>(
        'button[data-hero-slide]',
      )
      if (!button) return
      const hero = button.closest('.room-slider')
      const slide = heroSlides.find(
        (slide) => slide.id === button.dataset.heroSlide,
      )
      if (!(hero instanceof HTMLElement) || !slide) return
      hero.dataset.slide = slide.id
      requireElement('h2', HTMLElement, hero).innerHTML = slide.title
      requireElement('.eyebrow', HTMLElement, hero).textContent = slide.eyebrow
      requireElement('.hero-description', HTMLElement, hero).textContent =
        slide.description
      const link = requireElement('.hero-cta', HTMLAnchorElement, hero)
      link.href = slide.href
      link.innerHTML =
        'Explore the look' + ' <span aria-hidden="true">&nearr;</span>'
      const image = requireElement('figure > img', HTMLImageElement, hero)
      image.src = slide.room.image
      image.alt = slide.room.alt
      image.width = slide.id === 'kitchen' ? 1672 : 1536
      image.height = slide.id === 'kitchen' ? 941 : 1024
      requireElement('figcaption', HTMLElement, hero).textContent =
        slide.label.toUpperCase() + ' / RAHA'
      findElements('[data-hero-slide]', HTMLElement, hero).forEach((control) =>
        control.setAttribute('aria-pressed', String(control === button)),
      )
      requireElement('.hero-slide-status', HTMLElement, hero).textContent =
        slide.label + ' inspiration selected.'
    })
  }

  // Accessible shop-the-room panel.

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

  // Cart rendering.
  function renderCart() {
    const { items, quantity, subtotal } = calculateCart(getCart())
    const cartItems = requireElement('#cart-items', HTMLElement)
    cartItems.replaceChildren()
    for (const {
      key,
      product,
      variant,
      quantity: itemQuantity,
      total,
    } of items) {
      const item = document.createElement('li')
      item.className = 'cart-item'
      item.dataset.productId = product.id
      item.dataset.variantId = variant.id
      const image = document.createElement('img')
      image.src = variant.image
      image.alt = variant.alt
      const detail = document.createElement('div')
      const name = document.createElement('h3')
      name.textContent = product.name
      const color = document.createElement('p')
      color.className = 'cart-color'
      color.textContent = 'Color / finish: ' + variant.name
      const price = document.createElement('p')
      price.textContent = `${money(variant.price)} each | ${money(total)}`
      const controls = document.createElement('div')
      controls.className = 'quantity-controls'
      for (const [action, label, text] of [
        [
          'decrease',
          `Decrease ${product.name} quantity | ${variant.name}`,
          '-',
        ],
        [
          'quantity',
          `Quantity: ${itemQuantity} | ${variant.name}`,
          String(itemQuantity),
        ],
        [
          'increase',
          `Increase ${product.name} quantity | ${variant.name}`,
          '+',
        ],
        ['remove', `Remove ${product.name} | ${variant.name}`, 'Remove'],
      ]) {
        const control = document.createElement(
          action === 'quantity' ? 'span' : 'button',
        )
        control.textContent = text
        control.setAttribute('aria-label', label)
        if (control instanceof HTMLButtonElement) {
          control.type = 'button'
          control.dataset.action = action
          control.dataset.key = key
        }
        if (action === 'remove') control.className = 'remove-item'
        controls.append(control)
      }
      detail.append(name, color, price, controls)
      item.append(image, detail)
      cartItems.append(item)
    }
    requireElement('#cart-count', HTMLElement).textContent = String(quantity)
    requireElement('#cart-total', HTMLElement).textContent = money(subtotal)
    requireElement('#cart-empty', HTMLElement).hidden = quantity !== 0
    requireElement('#clear-cart', HTMLButtonElement).disabled = quantity === 0
    return quantity
  }

  // Page rendering, routes, forms, and delegated interaction handlers.
  const catalog = new Map(products.map((product) => [product.id, product]))
  let catalogueProducts: Product[] = []
  let catalogueState: 'idle' | 'loading' | 'error' | 'success' = 'idle'

  async function fetchCatalogue() {
    if (catalogueState === 'loading') return
    catalogueState = 'loading'
    renderProducts(false)
    try {
      catalogueProducts = await loadProducts()
      catalogueState = 'success'
    } catch {
      catalogueState = 'error'
    }
    // Render only if the catalogue controls still exist after navigation.
    renderProducts(false)
  }
  const view = requireElement('#page-view', HTMLElement)
  const registration = requireElement('#registration-dialog', HTMLDialogElement)
  const reopen = requireElement('.reopen-button', HTMLButtonElement)
  const registrationStatus = requireElement('#registration-status', HTMLElement)
  requireElement('form', HTMLFormElement, registration).addEventListener(
    'submit',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLFormElement)) return
      event.preventDefault()
      registration.close()
      registrationStatus.textContent =
        'Successful demo validation only. No account was created; no details were sent or stored.'
    },
  )
  registration.addEventListener('close', () => {
    requireElement('form', HTMLFormElement, registration).reset()
    reopen.hidden = false
    reopen.focus()
  })
  reopen.addEventListener('click', () => {
    registrationStatus.textContent = ''
    registration.show()
    reopen.hidden = true
    requireElement('#email', HTMLInputElement).focus()
  })
  const cartDialog = requireElement('#cart-dialog', HTMLDialogElement)
  const cartToggle = requireElement('.cart-toggle', HTMLButtonElement)
  const cartItems = requireElement('#cart-items', HTMLElement)

  cartToggle.addEventListener('click', () => cartDialog.showModal())
  cartDialog.addEventListener('close', () => cartToggle.focus())
  requireElement('#continue-shopping', HTMLButtonElement).addEventListener(
    'click',
    () => cartDialog.close(),
  )
  cartDialog.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('#clear-cart:not(:disabled)')) {
      clearCart()
      renderCart()
      requireElement('#continue-shopping', HTMLButtonElement).focus()
      return
    }
    const button = target.closest<HTMLButtonElement>('button[data-action]')
    if (!button) return
    const { key, action } = button.dataset
    if (
      !key ||
      (action !== 'remove' && action !== 'increase' && action !== 'decrease')
    )
      return
    changeCartItem(key, action)
    renderCart()
    const replacement = [...cartItems.querySelectorAll('button')].find(
      (control) =>
        control.dataset.key === key && control.dataset.action === action,
    )
    ;(replacement || requireElement('.close-cart', HTMLButtonElement)).focus()
  })

  function showGalleryPhoto(
    product: Product,
    variant: ProductVariant,
    id = 'product',
  ) {
    const photo = getProductGallery(product, variant).find(
      (photo) => photo.id === id,
    )
    if (!photo) return
    const image = requireElement('#gallery-image', HTMLImageElement)
    image.src = photo.image
    image.alt = photo.alt
    requireElement('#gallery-caption', HTMLElement).textContent = photo.caption
    findElements('[data-gallery]', HTMLElement, view).forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.gallery === id),
      ),
    )
  }

  function selectColor(product: Product, variant: ProductVariant) {
    findElements('button[data-color]', HTMLElement, view).forEach((button) => {
      const selected = button.dataset.color === variant.id
      button.setAttribute('aria-pressed', String(selected))
      requireElement('.swatch-check', HTMLElement, button).hidden = !selected
    })
    requireElement('#selected-color strong', HTMLElement).textContent =
      variant.name
    requireElement('.detail-price', HTMLElement).textContent = money(
      variant.price,
    )
    requireElement('#variant-availability', HTMLElement).textContent =
      variant.availability
    requireElement('.detail-description', HTMLElement).textContent =
      variant.description
    requireElement('#variant-materials', HTMLElement).textContent =
      variant.materials
    const add = requireElement('.detail-add', HTMLButtonElement)
    add.dataset.variant = variant.id
    add.disabled = !variant.available
    requireElement('#gallery-options', HTMLElement).innerHTML = galleryOptions(
      product,
      variant,
    )
    showGalleryPhoto(product, variant)
    const url = new URL(location.href)
    url.searchParams.set('color', variant.id)
    history.replaceState(null, '', url)
  }

  function renderProducts(syncURL = true) {
    const search = findElement('#product-search', HTMLInputElement)
    const categorySelect = findElement('#category-filter', HTMLSelectElement)
    const sortSelect = findElement('#price-sort', HTMLSelectElement)
    const grid = findElement('#catalog-grid', HTMLElement)
    if (!search || !categorySelect || !sortSelect || !grid) return
    const activeCategory = categorySelect.value
    const activeSort = isPriceSort(sortSelect.value)
      ? sortSelect.value
      : 'default'
    const ready = catalogueState === 'success'
    const message = requireElement('#catalogue-status', HTMLElement)
    message.textContent =
      catalogueState === 'error'
        ? 'We could not load the catalogue. Please try again.'
        : !ready
          ? 'Loading products…'
          : catalogueProducts.length === 0
            ? 'The catalogue is empty. Please check back soon.'
            : ''
    requireElement('#retry-products', HTMLElement).hidden =
      catalogueState !== 'error'
    grid.setAttribute('aria-busy', String(catalogueState === 'loading'))
    const sortedProducts = selectProducts(ready ? catalogueProducts : [], {
      query: search.value,
      category: activeCategory,
      sort: activeSort,
    })
    grid.innerHTML = sortedProducts.map((product) => card(product)).join('')
    const visible = sortedProducts.length
    requireElement('#product-count', HTMLElement).textContent = ready
      ? `${visible} of ${catalogueProducts.length} products`
      : ''
    requireElement('#catalogue-summary', HTMLElement).textContent = ready
      ? `${catalogueProducts.length} considered pieces. So many ways to make them yours.`
      : 'Explore our considered collection.'
    requireElement('#empty-products', HTMLElement).hidden =
      !ready || catalogueProducts.length === 0 || visible !== 0
    requireElement('#clear-search', HTMLElement).hidden = !search.value
    if (syncURL) {
      const url = new URL(location.href)
      url.searchParams.delete('collection')
      if (activeCategory === 'all') url.searchParams.delete('category')
      else url.searchParams.set('category', activeCategory)
      if (search.value) url.searchParams.set('q', search.value)
      else url.searchParams.delete('q')
      if (activeSort === 'default') url.searchParams.delete('sort')
      else url.searchParams.set('sort', activeSort)
      history.replaceState(null, '', url)
    }
  }
  function renderRoute(moveFocus = false) {
    closeShopRoom(false)
    stopEntrance()
    const params = new URLSearchParams(location.search)
    let page = params.get('page') || 'home'
    // Old category and collection URLs share the canonical Products route.
    if (
      page === 'category' ||
      page === 'collection' ||
      categories.some(([id]) => id === page) ||
      Object.hasOwn(categoryAliases, page) ||
      collections.some(({ id }) => id === page)
    ) {
      const legacy = params.get('id') || params.get('slug') || page
      const key =
        page !== 'category' &&
        (page === 'collection' || collections.some(({ id }) => id === legacy))
          ? 'collection'
          : 'category'
      params.set(key, params.get(key) || legacy)
      params.set('page', 'products')
      page = 'products'
      history.replaceState(null, '', '/?' + params + location.hash)
    }
    if (
      page === 'product' &&
      params.get('id') !== null &&
      Object.hasOwn(retiredProducts, params.get('id') || '')
    ) {
      const retiredCategory = retiredProducts[params.get('id') || '']
      if (retiredCategory) params.set('category', retiredCategory)
      params.delete('id')
      params.delete('color')
      params.set('page', 'products')
      page = 'products'
    }
    const selectedCategory = params.get('category')
    const alias =
      selectedCategory && Object.hasOwn(categoryAliases, selectedCategory)
        ? categoryAliases[selectedCategory]
        : undefined
    if (alias) params.set('category', alias)
    if (params.toString() !== new URLSearchParams(location.search).toString())
      history.replaceState(null, '', '/?' + params + location.hash)
    const result = getPage(page, params.get('id'), params.get('color'))
    view.innerHTML = result.markup
    document.title = `${result.title} — RAHA`
    findElements('[data-page]', HTMLElement).forEach((link) => {
      const active =
        link.dataset.page === (page === 'product' ? 'products' : page)
      link.classList.toggle('active', active)
      if (active) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
    if (page === 'products') {
      const category = params.get('category')
      const collection = params.get('collection')
      requireElement('#category-filter', HTMLSelectElement).value =
        categories.some(([id]) => id === category)
          ? category || 'all'
          : collections.some(({ id }) => id === collection)
            ? 'collection:' + collection
            : collections.some(({ id }) => 'collection:' + id === category)
              ? category || 'all'
              : 'all'
      requireElement('#price-sort', HTMLSelectElement).value = isPriceSort(
        params.get('sort'),
      )
        ? params.get('sort') || 'default'
        : 'default'
      requireElement('#product-search', HTMLInputElement).value =
        params.get('q') || ''
      renderProducts(false)
      void fetchCatalogue()
    }
    requireElement('#registration', HTMLElement).hidden = page !== 'home'
    requireElement('form', HTMLFormElement, registration).reset()
    registrationStatus.textContent = ''
    requireElement('#cart-status', HTMLElement).textContent = ''
    requestAnimationFrame(() => {
      const target = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null
      if (target) {
        target.tabIndex = -1
        target.scrollIntoView()
        if (moveFocus) target.focus({ preventScroll: true })
      } else if (moveFocus) {
        requireElement('#main-content', HTMLElement).focus({
          preventScroll: true,
        })
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
  }
  window.addEventListener('popstate', () => renderRoute(true))
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest<HTMLAnchorElement>('a[data-route]')
    if (
      link &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault()
      history.pushState(null, '', link.href)
      renderRoute(true)
      return
    }
    const add = target.closest<HTMLButtonElement>('button[data-product]')
    if (add) {
      const product = catalog.get(add.dataset.product || '')
      if (!product) return
      const variant = add.dataset.variant
        ? product.variants.find((option) => option.id === add.dataset.variant)
        : getVariant(product)
      if (!variant?.available) return
      addCartItem(product.id, variant.id)
      const quantity = renderCart()
      requireElement('#cart-status', HTMLElement).textContent =
        `${product.name} | ${variant.name} added to your local cart. ${quantity} items in total.`
    }
  })
  view.addEventListener('input', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.id === 'product-search') renderProducts()
  })
  view.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.id === 'category-filter' || target.id === 'price-sort')
      renderProducts()
  })
  view.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('#retry-products')) void fetchCatalogue()
    if (target.closest('#clear-search')) {
      requireElement('#product-search', HTMLInputElement).value = ''
      renderProducts()
      requireElement('#product-search', HTMLInputElement).focus()
    }
    if (target.closest('#reset-filters')) {
      requireElement('#category-filter', HTMLSelectElement).value = 'all'
      requireElement('#price-sort', HTMLSelectElement).value = 'default'
      requireElement('#product-search', HTMLInputElement).value = ''
      renderProducts()
      requireElement('#product-search', HTMLInputElement).focus()
    }
    const color = target.closest<HTMLButtonElement>('button[data-color]')
    if (color) {
      const product = catalog.get(
        new URLSearchParams(location.search).get('id') || '',
      )
      const variant = product?.variants.find(
        (option) => option.id === color.dataset.color,
      )
      if (product && variant) selectColor(product, variant)
    }
    const gallery = target.closest('[data-gallery]')
    if (gallery instanceof HTMLElement) {
      const params = new URLSearchParams(location.search)
      const product = catalog.get(params.get('id') || '')
      if (!product) return
      const variant = getVariant(product, params.get('color'))
      showGalleryPhoto(product, variant, gallery.dataset.gallery)
    }
  })
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
    if (target.id === 'contact-form') {
      event.preventDefault()
      target.reset()
      requireElement('#contact-status', HTMLElement).textContent =
        'Demo complete. No message was sent and your entries have been cleared.'
    }
  })
  initializeHeroSlider()
  initializeShopRoom()
  renderCart()
  renderRoute()
  startEntrance()
}
