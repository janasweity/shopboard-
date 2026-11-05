import { requireElement, findElements } from '../../shared/ui/dom.ts'
import type { UIDependencies } from '../../shared/ui/app.types.ts'
import type { Product, ProductVariant } from './products.types.ts'
import { getVariant, money } from '../../data.ts'
import { galleryOptions } from '../../pages.ts'
import { getProductGallery } from '../../product-gallery.ts'

export function initializeGallery({
  products,
}: Pick<UIDependencies, 'products'>) {
  const view = requireElement('#page-view', HTMLElement)
  const catalog = new Map(products.map((product) => [product.id, product]))
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

  view.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
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
}
