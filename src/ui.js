import {
  getVariant,
  categories,
  categoryAliases,
  retiredProducts,
  collections,
  money,
  productURL,
} from './data.js'
import { heroSlides } from './data/hero-slides.js'
import { getPage, card, galleryOptions } from './pages.js'
import { getProductGallery } from './product-gallery.js'

// Browser interactions are initialized once by main.js.
export function initializeUI({
  products,
  selectProducts,
  calculateCart,
  calculateRoomArea,
  getCart,
  addCartItem,
  changeCartItem,
  clearCart,
  claimEntranceSession,
}) {
  // Entrance animation and cleanup.
  let cleanup = () => {}
  function stopEntrance() {
    cleanup()
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
    const targets = []
    const mark = (element, className, delay) => {
      if (!element) return
      element.classList.add(className)
      element.style.setProperty('--entrance-delay', `${delay}ms`)
      targets.push([element, className])
    }
    const onMotionChange = (event) => {
      if (event.matches) stopEntrance()
    }
    const onEscape = (event) => {
      if (event.key === 'Escape') stopEntrance()
    }
    const onFocus = (event) => {
      if (!intro.contains(event.target)) stopEntrance()
    }
    const timer = window.setTimeout(stopEntrance, 3750)
    cleanup = () => {
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
      cleanup = () => {}
      if (restoreFocus)
        document.querySelector('#main-content').focus({ preventScroll: true })
    }
    intro.querySelector('.skip-intro').addEventListener('click', stopEntrance)
    reducedMotion.addEventListener('change', onMotionChange)
    document.addEventListener('keydown', onEscape)
    mark(
      document.querySelector('.home-hero figure > img'),
      'entrance-hero',
      2100,
    )
    mark(document.querySelector('#page-view h1'), 'entrance-copy', 2350)
    mark(
      document.querySelector('#page-view .search-field'),
      'entrance-search',
      2450,
    )
    document
      .querySelectorAll('#page-view .product-card')
      .forEach((card, index) =>
        mark(card, 'entrance-card', 2550 + Math.min(index, 11) * 50),
      )
    document.documentElement.dataset.entrance = 'playing'
    document.body.append(intro)
    intro.classList.add('is-playing')
    intro.querySelector('.skip-intro').focus({ preventScroll: true })
    document.addEventListener('focusin', onFocus)
  }

  // Manual room slider.

  let initialized = false

  function initializeHeroSlider() {
    if (initialized) return
    initialized = true
    // Manual controls avoid unexpected motion and leave the visitor in control.
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-hero-slide]')
      if (!button) return
      const hero = button.closest('.room-slider')
      const slide = heroSlides.find(
        (slide) => slide.id === button.dataset.heroSlide,
      )
      if (!hero || !slide) return
      hero.dataset.slide = slide.id
      hero.querySelector('h2').innerHTML = slide.title
      hero.querySelector('.eyebrow').textContent = slide.eyebrow
      hero.querySelector('.hero-description').textContent = slide.description
      const link = hero.querySelector('.hero-cta')
      link.href = slide.href
      link.innerHTML =
        'Explore the look' + ' <span aria-hidden="true">&nearr;</span>'
      const image = hero.querySelector('figure > img')
      image.src = slide.room.image
      image.alt = slide.room.alt
      image.width = slide.id === 'kitchen' ? 1672 : 1536
      image.height = slide.id === 'kitchen' ? 941 : 1024
      hero.querySelector('figcaption').textContent =
        slide.label.toUpperCase() + ' / RAHA'
      hero
        .querySelectorAll('[data-hero-slide]')
        .forEach((control) =>
          control.setAttribute('aria-pressed', String(control === button)),
        )
      hero.querySelector('.hero-slide-status').textContent =
        slide.label + ' inspiration selected.'
    })
  }

  // Accessible shop-the-room panel.

  let activeHotspot = null
  let pointerInteraction = false
  const panel = () => document.querySelector('#shop-room-panel')

  function closeShopRoom(restoreFocus = true) {
    const trigger = activeHotspot
    const current = panel()
    if (current) current.hidden = true
    activeHotspot = null
    document
      .querySelectorAll('[data-room-hotspot]')
      .forEach((button) => button.setAttribute('aria-expanded', 'false'))
    if (
      restoreFocus &&
      trigger?.isConnected &&
      trigger.getClientRects().length
    ) {
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
    current.querySelector('.room-panel-price').textContent = money(
      variant.price,
    )
    current.querySelector('a').href =
      productURL(product.id) + '&color=' + encodeURIComponent(variant.id)
    current.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    current.querySelector('[data-room-close]').focus({ preventScroll: true })
  }

  function initializeShopRoom() {
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

  // Cart rendering.
  function renderCart() {
    const { items, quantity, subtotal } = calculateCart(getCart())
    const cartItems = document.querySelector('#cart-items')
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
        if (action !== 'quantity') {
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
    document.querySelector('#cart-count').textContent = String(quantity)
    document.querySelector('#cart-total').textContent = money(subtotal)
    document.querySelector('#cart-empty').hidden = quantity !== 0
    document.querySelector('#clear-cart').disabled = quantity === 0
    return quantity
  }

  // Page rendering, routes, forms, and delegated interaction handlers.
  const catalog = new Map(products.map((product) => [product.id, product]))
  const view = document.querySelector('#page-view')
  const registration = document.querySelector('#registration-dialog')
  const reopen = document.querySelector('.reopen-button')
  const registrationStatus = document.querySelector('#registration-status')
  registration.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    registration.close()
    registrationStatus.textContent =
      'Successful demo validation only. No account was created; no details were sent or stored.'
  })
  registration.addEventListener('close', () => {
    registration.querySelector('form').reset()
    reopen.hidden = false
    reopen.focus()
  })
  reopen.addEventListener('click', () => {
    registrationStatus.textContent = ''
    registration.show()
    reopen.hidden = true
    document.querySelector('#email').focus()
  })
  const cartDialog = document.querySelector('#cart-dialog')
  const cartToggle = document.querySelector('.cart-toggle')
  const cartItems = document.querySelector('#cart-items')

  cartToggle.addEventListener('click', () => cartDialog.showModal())
  cartDialog.addEventListener('close', () => cartToggle.focus())
  document
    .querySelector('#continue-shopping')
    .addEventListener('click', () => cartDialog.close())
  cartDialog.addEventListener('click', (event) => {
    if (event.target.closest('#clear-cart:not(:disabled)')) {
      clearCart()
      renderCart()
      document.querySelector('#continue-shopping').focus()
      return
    }
    const button = event.target.closest('button[data-action]')
    if (!button) return
    const { key, action } = button.dataset
    changeCartItem(key, action)
    renderCart()
    const replacement = [...cartItems.querySelectorAll('button')].find(
      (control) =>
        control.dataset.key === key && control.dataset.action === action,
    )
    ;(replacement || document.querySelector('.close-cart')).focus()
  })

  function showGalleryPhoto(product, variant, id = 'product') {
    const photo = getProductGallery(product, variant).find(
      (photo) => photo.id === id,
    )
    if (!photo) return
    const image = document.querySelector('#gallery-image')
    image.src = photo.image
    image.alt = photo.alt
    document.querySelector('#gallery-caption').textContent = photo.caption
    view
      .querySelectorAll('[data-gallery]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.gallery === id),
        ),
      )
  }

  function selectColor(product, variant) {
    view.querySelectorAll('button[data-color]').forEach((button) => {
      const selected = button.dataset.color === variant.id
      button.setAttribute('aria-pressed', String(selected))
      button.querySelector('.swatch-check').hidden = !selected
    })
    document.querySelector('#selected-color strong').textContent = variant.name
    document.querySelector('.detail-price').textContent = money(variant.price)
    document.querySelector('#variant-availability').textContent =
      variant.availability
    document.querySelector('.detail-description').textContent =
      variant.description
    document.querySelector('#variant-materials').textContent = variant.materials
    const add = document.querySelector('.detail-add')
    add.dataset.variant = variant.id
    add.disabled = !variant.available
    document.querySelector('#gallery-options').innerHTML = galleryOptions(
      product,
      variant,
    )
    showGalleryPhoto(product, variant)
    const url = new URL(location.href)
    url.searchParams.set('color', variant.id)
    history.replaceState(null, '', url)
  }

  function renderProducts(syncURL = true) {
    const search = document.querySelector('#product-search')
    const categorySelect = document.querySelector('#category-filter')
    const sortSelect = document.querySelector('#price-sort')
    const grid = document.querySelector('#catalog-grid')
    if (!search || !categorySelect || !sortSelect || !grid) return
    const activeCategory = categorySelect.value
    const activeSort = sortSelect.value
    const sortedProducts = selectProducts(products, {
      query: search.value,
      category: activeCategory,
      sort: activeSort,
    })
    grid.innerHTML = sortedProducts.map((product) => card(product)).join('')
    const visible = sortedProducts.length
    document.querySelector('#product-count').textContent =
      `${visible} of ${products.length} products`
    document.querySelector('#empty-products').hidden = visible !== 0
    document.querySelector('#clear-search').hidden = !search.value
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
      Object.hasOwn(retiredProducts, params.get('id'))
    ) {
      params.set('category', retiredProducts[params.get('id')])
      params.delete('id')
      params.delete('color')
      params.set('page', 'products')
      page = 'products'
    }
    const selectedCategory = params.get('category')
    if (Object.hasOwn(categoryAliases, selectedCategory))
      params.set('category', categoryAliases[selectedCategory])
    if (params.toString() !== new URLSearchParams(location.search).toString())
      history.replaceState(null, '', '/?' + params + location.hash)
    const result = getPage(page, params.get('id'), params.get('color'))
    view.innerHTML = result.markup
    document.title = `${result.title} — RAHA`
    document.querySelectorAll('[data-page]').forEach((link) => {
      const active =
        link.dataset.page === (page === 'product' ? 'products' : page)
      link.classList.toggle('active', active)
      if (active) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
    if (page === 'products') {
      const category = params.get('category')
      const collection = params.get('collection')
      document.querySelector('#category-filter').value = categories.some(
        ([id]) => id === category,
      )
        ? category
        : collections.some(({ id }) => id === collection)
          ? 'collection:' + collection
          : collections.some(({ id }) => 'collection:' + id === category)
            ? category
            : 'all'
      document.querySelector('#price-sort').value = [
        'price-asc',
        'price-desc',
      ].includes(params.get('sort'))
        ? params.get('sort')
        : 'default'
      document.querySelector('#product-search').value = params.get('q') || ''
      renderProducts(false)
    }
    document.querySelector('#registration').hidden = page !== 'home'
    registration.querySelector('form').reset()
    registrationStatus.textContent = ''
    document.querySelector('#cart-status').textContent = ''
    requestAnimationFrame(() => {
      const target = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null
      if (target) {
        target.tabIndex = -1
        target.scrollIntoView()
        if (moveFocus) target.focus({ preventScroll: true })
      } else if (moveFocus) {
        document.querySelector('#main-content').focus({ preventScroll: true })
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
  }
  window.addEventListener('popstate', () => renderRoute(true))
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-route]')
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
    const add = event.target.closest('button[data-product]')
    if (add) {
      const product = catalog.get(add.dataset.product)
      if (!product) return
      const variant = add.dataset.variant
        ? product.variants.find((option) => option.id === add.dataset.variant)
        : getVariant(product)
      if (!variant?.available) return
      addCartItem(product.id, variant.id)
      const quantity = renderCart()
      document.querySelector('#cart-status').textContent =
        `${product.name} | ${variant.name} added to your local cart. ${quantity} items in total.`
    }
  })
  view.addEventListener('input', (event) => {
    if (event.target.id === 'product-search') renderProducts()
  })
  view.addEventListener('change', (event) => {
    if (
      event.target.id === 'category-filter' ||
      event.target.id === 'price-sort'
    )
      renderProducts()
  })
  view.addEventListener('click', (event) => {
    if (event.target.closest('#clear-search')) {
      document.querySelector('#product-search').value = ''
      renderProducts()
      document.querySelector('#product-search').focus()
    }
    if (event.target.closest('#reset-filters')) {
      document.querySelector('#category-filter').value = 'all'
      document.querySelector('#price-sort').value = 'default'
      document.querySelector('#product-search').value = ''
      renderProducts()
      document.querySelector('#product-search').focus()
    }
    const color = event.target.closest('button[data-color]')
    if (color) {
      const product = catalog.get(
        new URLSearchParams(location.search).get('id'),
      )
      const variant = product?.variants.find(
        (option) => option.id === color.dataset.color,
      )
      if (variant) selectColor(product, variant)
    }
    const gallery = event.target.closest('[data-gallery]')
    if (gallery) {
      const params = new URLSearchParams(location.search)
      const product = catalog.get(params.get('id'))
      if (!product) return
      const variant = getVariant(product, params.get('color'))
      showGalleryPhoto(product, variant, gallery.dataset.gallery)
    }
  })
  view.addEventListener('submit', (event) => {
    if (event.target.id === 'room-planner') {
      event.preventDefault()
      const area = calculateRoomArea(
        document.querySelector('#room-width').valueAsNumber,
        document.querySelector('#room-length').valueAsNumber,
      )
      document.querySelector('#room-area').textContent =
        `Your room is ${area.toLocaleString('en-US', { maximumFractionDigits: 2 })} m². A good starting point for your layout.`
    }
    if (event.target.id === 'contact-form') {
      event.preventDefault()
      event.target.reset()
      document.querySelector('#contact-status').textContent =
        'Demo complete. No message was sent and your entries have been cleared.'
    }
  })
  initializeHeroSlider()
  initializeShopRoom()
  renderCart()
  renderRoute()
  startEntrance()
}
