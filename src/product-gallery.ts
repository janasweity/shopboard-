import type {
  Product,
  ProductVariant,
} from './modules/products/products.types.ts'
import { productGalleryImages } from './data/product-gallery-images.ts'

export function getProductGallery(product: Product, variant: ProductVariant) {
  const primary = {
    id: 'product',
    label: 'Product',
    image: variant.image,
    alt: variant.alt,
    caption: `${product.name} / ${variant.name} / product photograph`,
  }
  const gallery = productGalleryImages[product.id]
  if (!gallery || gallery.finish !== variant.id) return [primary]
  return [
    primary,
    ...gallery.views.map((view) => ({
      ...view,
      caption: `${product.name} / ${variant.name} / ${view.label.toLowerCase()}`,
    })),
  ]
}
