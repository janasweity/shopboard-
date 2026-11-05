import { requireElement } from '../../shared/ui/dom.ts'
import type { UIDependencies } from '../../shared/ui/app.types.ts'
import { money, getVariant } from '../../data.ts'

export function initializeCart({
  products,
  calculateCart,
  getCart,
  addCartItem,
  changeCartItem,
  clearCart,
}: Pick<
  UIDependencies,
  | 'products'
  | 'calculateCart'
  | 'getCart'
  | 'addCartItem'
  | 'changeCartItem'
  | 'clearCart'
>) {
  const catalog = new Map(products.map((product) => [product.id, product]))
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

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
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

  renderCart()
  return {
    resetStatus: () => {
      requireElement('#cart-status', HTMLElement).textContent = ''
    },
  }
}
