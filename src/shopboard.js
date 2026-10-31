import { addCartItem, changeCartItem } from './state.js'
import { renderCart } from './ui.js'
import { initializeHeroSlider } from './hero-slider.js'
import { closeShopRoom, initializeShopRoom } from './shop-room.js'
import './styles/tokens.css'
import './styles/main.css'

import {
  products,
  getVariant,
  categories,
  categoryAliases,
  retiredProducts,
  collections,
  money,
} from './data/catalog.js'
import { getPage, card, galleryOptions } from './pages.js'
import { getProductGallery } from './product-gallery.js'
import { startEntrance, stopEntrance } from './entrance.js'

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
cartItems.addEventListener('click', (event) => {
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
  const query = search.value.trim().toLowerCase()
  // Apply name and selected category (or legacy collection) before sorting.
  const filteredProducts = products.filter((product) => {
    return (
      (activeCategory === 'all' ||
        activeCategory === product.category ||
        product.categories?.includes(activeCategory) ||
        activeCategory === 'collection:' + product.collection) &&
      product.name.toLowerCase().includes(query)
    )
  })
  // Sort a copy, never the source catalogue or the filtered array.
  const sortedProducts = [...filteredProducts]
  if (activeSort === 'price-asc')
    sortedProducts.sort((a, b) => a.price - b.price)
  if (activeSort === 'price-desc')
    sortedProducts.sort((a, b) => b.price - a.price)
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
  if (page === 'product' && Object.hasOwn(retiredProducts, params.get('id'))) {
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
  if (event.target.id === 'category-filter' || event.target.id === 'price-sort')
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
    const product = catalog.get(new URLSearchParams(location.search).get('id'))
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
    const area =
      document.querySelector('#room-width').valueAsNumber *
      document.querySelector('#room-length').valueAsNumber
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
