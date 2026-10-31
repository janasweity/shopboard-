import { money } from './data/catalog.js'
import { calculateCart } from './logic.js'
import { getCart } from './state.js'

export function renderCart() {
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
      ['decrease', `Decrease ${product.name} quantity | ${variant.name}`, '-'],
      [
        'quantity',
        `Quantity: ${itemQuantity} | ${variant.name}`,
        String(itemQuantity),
      ],
      ['increase', `Increase ${product.name} quantity | ${variant.name}`, '+'],
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
  return quantity
}
