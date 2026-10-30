import './styles/tokens.css'
import './styles/main.css'
import { products, categories, rooms, money } from './data/catalog.js'
import { getPage } from './pages.js'
import { startEntrance, stopEntrance } from './entrance.js'

const catalog = new Map(products.map((product) => [product.id, product]))
const view = document.querySelector('#page-view')
const registration = document.querySelector('#registration-dialog')
const reopen = document.querySelector('.reopen-button')
registration.addEventListener('close', () => {
  registration.querySelector('form').reset()
  reopen.hidden = false
  reopen.focus()
})
reopen.addEventListener('click', () => {
  registration.show()
  reopen.hidden = true
  document.querySelector('#email').focus()
})
const cart = new Map()
const cartDialog = document.querySelector('#cart-dialog')
const cartToggle = document.querySelector('.cart-toggle')
const cartItems = document.querySelector('#cart-items')

function renderCart() {
  let quantity = 0
  let subtotal = 0
  cartItems.replaceChildren()
  for (const [id, amount] of cart) {
    const product = catalog.get(id)
    quantity += amount
    subtotal += product.price * amount
    const item = document.createElement('li')
    item.className = 'cart-item'
    const image = document.createElement('img')
    image.src = product.image
    image.alt = ''
    const detail = document.createElement('div')
    const name = document.createElement('h3')
    name.textContent = product.name
    const price = document.createElement('p')
    price.textContent = `${money(product.price)} each · ${money(product.price * amount)}`
    const controls = document.createElement('div')
    controls.className = 'quantity-controls'
    for (const [action, label, text] of [
      ['decrease', `Decrease ${product.name} quantity`, '−'],
      ['quantity', `Quantity: ${amount}`, String(amount)],
      ['increase', `Increase ${product.name} quantity`, '+'],
      ['remove', `Remove ${product.name}`, 'Remove'],
    ]) {
      const control = document.createElement(
        action === 'quantity' ? 'span' : 'button',
      )
      control.textContent = text
      control.setAttribute('aria-label', label)
      if (action !== 'quantity') {
        control.type = 'button'
        control.dataset.action = action
        control.dataset.id = id
      }
      if (action === 'remove') control.className = 'remove-item'
      controls.append(control)
    }
    detail.append(name, price, controls)
    item.append(image, detail)
    cartItems.append(item)
  }
  document.querySelector('#cart-count').textContent = String(quantity)
  document.querySelector('#cart-total').textContent = money(subtotal)
  document.querySelector('#cart-empty').hidden = quantity !== 0
}

cartToggle.addEventListener('click', () => cartDialog.showModal())
cartDialog.addEventListener('close', () => cartToggle.focus())
document
  .querySelector('#continue-shopping')
  .addEventListener('click', () => cartDialog.close())
cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]')
  if (!button) return
  const { id, action } = button.dataset
  const amount = cart.get(id)
  if (action === 'remove' || (action === 'decrease' && amount === 1))
    cart.delete(id)
  else cart.set(id, amount + (action === 'increase' ? 1 : -1))
  renderCart()
  const replacement = [...cartItems.querySelectorAll('button')].find(
    (control) => control.dataset.id === id && control.dataset.action === action,
  )
  ;(replacement || document.querySelector('.close-cart')).focus()
})

let activeCategory = 'all'
function updateProducts(syncURL = true) {
  const search = document.querySelector('#product-search')
  if (!search) return
  const query = search.value.trim().toLowerCase()
  let visible = 0
  view.querySelectorAll('.product-card').forEach((card) => {
    const product = catalog.get(card.dataset.id)
    const searchable =
      `${product.name} ${product.description} ${product.materials} ${product.category}`.toLowerCase()
    card.hidden =
      !(activeCategory === 'all' || activeCategory === product.category) ||
      !searchable.includes(query)
    if (!card.hidden) visible++
  })
  document.querySelector('#product-count').textContent =
    `${visible} of ${products.length} products`
  document.querySelector('#empty-products').hidden = visible !== 0
  document.querySelector('#clear-search').hidden = !search.value
  view
    .querySelectorAll('[data-filter]')
    .forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.filter === activeCategory),
      ),
    )
  if (syncURL) {
    const url = new URL(location.href)
    if (activeCategory === 'all') url.searchParams.delete('category')
    else url.searchParams.set('category', activeCategory)
    if (search.value) url.searchParams.set('q', search.value)
    else url.searchParams.delete('q')
    history.replaceState(null, '', url)
  }
}
function renderRoute(moveFocus = false) {
  stopEntrance()
  const params = new URLSearchParams(location.search)
  const page = params.get('page') || 'home'
  const result = getPage(page, params.get('id'))
  view.innerHTML = result.markup
  document.title = `${result.title} — Havlo Home`
  document.querySelectorAll('[data-page]').forEach((link) => {
    const active =
      link.dataset.page === (page === 'product' ? 'products' : page)
    link.classList.toggle('active', active)
    if (active) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
  if (page === 'products') {
    activeCategory = categories.some(([id]) => id === params.get('category'))
      ? params.get('category')
      : 'all'
    document.querySelector('#product-search').value = params.get('q') || ''
    updateProducts(false)
  }
  registration.querySelector('form').reset()
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
    cart.set(product.id, (cart.get(product.id) || 0) + 1)
    renderCart()
    document.querySelector('#cart-status').textContent =
      `${product.name} added to your local cart. ${[...cart.values()].reduce((a, b) => a + b, 0)} items in total.`
  }
})
view.addEventListener('input', (event) => {
  if (event.target.id === 'product-search') updateProducts()
})
view.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]')
  if (filter) {
    activeCategory = filter.dataset.filter
    updateProducts()
  }
  if (event.target.closest('#clear-search')) {
    document.querySelector('#product-search').value = ''
    updateProducts()
    document.querySelector('#product-search').focus()
  }
  if (event.target.closest('#reset-filters')) {
    activeCategory = 'all'
    document.querySelector('#product-search').value = ''
    updateProducts()
    document.querySelector('#product-search').focus()
  }
  const gallery = event.target.closest('[data-gallery]')
  if (gallery) {
    const product = catalog.get(new URLSearchParams(location.search).get('id'))
    const room = rooms.find((room) => room.id === product.room)
    const roomSelected = gallery.dataset.gallery === 'room'
    const image = document.querySelector('#gallery-image')
    image.src = roomSelected ? room.image : product.image
    image.alt = roomSelected ? room.alt : product.alt
    document.querySelector('#gallery-caption').textContent = roomSelected
      ? `${room.name} styling inspiration — not an exact product setting`
      : `${product.name} / product photograph`
    view
      .querySelectorAll('[data-gallery]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button === gallery)),
      )
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
renderRoute()
startEntrance()
