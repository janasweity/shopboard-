import { findElement, requireElement } from '../../shared/ui/dom.ts'
import type { UIDependencies } from '../../shared/ui/app.types.ts'
import type { Product } from './products.types.ts'
import { isPriceSort } from './products.logic.ts'
import { categories, collections } from '../../data.ts'
import { card } from '../../pages.ts'

export function initializeProducts({
  loadProducts,
  selectProducts,
}: Pick<UIDependencies, 'loadProducts' | 'selectProducts'>) {
  const view = requireElement('#page-view', HTMLElement)
  let catalogueProducts: Product[] = []
  let catalogueState: 'idle' | 'loading' | 'error' | 'success' = 'idle'
  let generation = 0
  async function fetchCatalogue() {
    if (catalogueState === 'loading') return
    const request = generation
    catalogueState = 'loading'
    renderProducts(false)
    try {
      const loaded = await loadProducts()
      if (request !== generation) return
      catalogueProducts = loaded
      catalogueState = 'success'
    } catch {
      if (request !== generation) return
      catalogueState = 'error'
    }
    renderProducts(false)
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
  })
  return {
    leave() {
      generation++
      catalogueState = 'idle'
    },
    enter(params: URLSearchParams) {
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
      void fetchCatalogue()
    },
  }
}
