import type { Product, PriceSort, ProductSelection } from './products.types.ts'

export function isPriceSort(value: string | null): value is PriceSort {
  return value === 'default' || value === 'price-asc' || value === 'price-desc'
}

export function selectProducts<T extends Product>(
  source: readonly T[],
  { query = '', category = 'all', sort = 'default' }: ProductSelection = {},
): T[] {
  const search = query.trim().toLowerCase()
  const filtered = source.filter(
    (product) =>
      (category === 'all' ||
        category === product.category ||
        product.categories?.some((item) => item === category) ||
        category === 'collection:' + product.collection) &&
      product.name.toLowerCase().includes(search),
  )
  // Sorting a copy preserves both the source and the filtered order.
  const sorted = [...filtered]
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
  return sorted
}
