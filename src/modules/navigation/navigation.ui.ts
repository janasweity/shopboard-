import { requireElement, findElements } from '../../shared/ui/dom.ts'
import {
  categories,
  categoryAliases,
  collections,
  retiredProducts,
} from '../../data.ts'
import { getPage } from '../../pages.ts'

export function initializeNavigation(
  beforeRender: () => void,
  afterRender: (page: string, params: URLSearchParams) => void,
) {
  const view = requireElement('#page-view', HTMLElement)
  let focusFrame: number | undefined
  function renderRoute(moveFocus = false) {
    beforeRender()
    if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
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
      params.get('id') !== null &&
      Object.hasOwn(retiredProducts, params.get('id') || '')
    ) {
      const retiredCategory = retiredProducts[params.get('id') || '']
      if (retiredCategory) params.set('category', retiredCategory)
      params.delete('id')
      params.delete('color')
      params.set('page', 'products')
      page = 'products'
    }
    const selectedCategory = params.get('category')
    const alias =
      selectedCategory && Object.hasOwn(categoryAliases, selectedCategory)
        ? categoryAliases[selectedCategory]
        : undefined
    if (alias) params.set('category', alias)
    if (params.toString() !== new URLSearchParams(location.search).toString())
      history.replaceState(null, '', '/?' + params + location.hash)
    const result = getPage(page, params.get('id'), params.get('color'))
    view.innerHTML = result.markup
    document.title = `${result.title} — RAHA`
    findElements('[data-page]', HTMLElement).forEach((link) => {
      const active =
        link.dataset.page === (page === 'product' ? 'products' : page)
      link.classList.toggle('active', active)
      if (active) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
    afterRender(page, params)
    focusFrame = requestAnimationFrame(() => {
      const target = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null
      if (target) {
        target.tabIndex = -1
        target.scrollIntoView()
        if (moveFocus) target.focus({ preventScroll: true })
      } else if (moveFocus) {
        requireElement('#main-content', HTMLElement).focus({
          preventScroll: true,
        })
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
  }
  window.addEventListener('popstate', () => renderRoute(true))

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest<HTMLAnchorElement>('a[data-route]')
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
  })
  renderRoute()
}
