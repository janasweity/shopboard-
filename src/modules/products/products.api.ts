import type { Product, ProductVariant } from './products.types.ts'
import type { ApiProduct, ApiVariant } from './products.api.types.ts'

// The storefront catalogue uses USD; the API exposes integer cents.
export function serializeProducts(products: readonly Product[]): ApiProduct[] {
  const mapVariant = (variant: ProductVariant): ApiVariant => ({
    ...variant,
    price: Math.round(variant.price * 100),
  })
  return products.map((product): ApiProduct => {
    const [first, ...rest] = product.variants
    return {
      ...product,
      price: Math.round(product.price * 100),
      variants: [mapVariant(first), ...rest.map(mapVariant)],
    }
  })
}
