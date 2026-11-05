import {
  findElement,
  requireElement,
  findElements,
} from '../../shared/ui/dom.ts'
import type { UIDependencies } from '../../shared/ui/app.types.ts'

export function initializeEntrance({
  claimEntranceSession,
}: Pick<UIDependencies, 'claimEntranceSession'>) {
  const state = { cleanup: () => {} }
  function stopEntrance() {
    state.cleanup()
  }

  function startEntrance() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const url = new URL(location.href)
    const replay = url.searchParams.get('intro') === 'replay'
    if (replay) {
      url.searchParams.delete('intro')
      history.replaceState(null, '', url)
    }
    if (!claimEntranceSession(replay)) return
    if (reducedMotion.matches) return

    // Created only after the app renders. CSS never hides the underlying page.
    const intro = document.createElement('section')
    intro.className = 'store-intro'
    intro.setAttribute('aria-labelledby', 'intro-title')
    intro.innerHTML =
      '<div class="intro-brand"><p class="intro-kicker">MAKE ROOM FOR LIVING</p><p id="intro-title">RAHA<span>HOME &amp; LIVING</span></p><span class="intro-line" aria-hidden="true"></span></div><button type="button" class="skip-intro">Skip intro <span aria-hidden="true">↗</span></button>'
    const targets: [HTMLElement, string][] = []
    const mark = (
      element: HTMLElement | null,
      className: string,
      delay: number,
    ) => {
      if (!element) return
      element.classList.add(className)
      element.style.setProperty('--entrance-delay', `${delay}ms`)
      targets.push([element, className])
    }
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) stopEntrance()
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stopEntrance()
    }
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !intro.contains(event.target))
        stopEntrance()
    }
    const timer = window.setTimeout(stopEntrance, 3750)
    state.cleanup = () => {
      window.clearTimeout(timer)
      const restoreFocus = intro.contains(document.activeElement)
      targets.forEach(([element, className]) => {
        element.classList.remove(className)
        element.style.removeProperty('--entrance-delay')
      })
      intro.remove()
      delete document.documentElement.dataset.entrance
      reducedMotion.removeEventListener('change', onMotionChange)
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('focusin', onFocus)
      state.cleanup = () => {}
      if (restoreFocus)
        requireElement('#main-content', HTMLElement).focus({
          preventScroll: true,
        })
    }
    requireElement('.skip-intro', HTMLButtonElement, intro).addEventListener(
      'click',
      stopEntrance,
    )
    reducedMotion.addEventListener('change', onMotionChange)
    document.addEventListener('keydown', onEscape)
    mark(
      findElement('.home-hero figure > img', HTMLImageElement),
      'entrance-hero',
      2100,
    )
    mark(findElement('#page-view h1', HTMLElement), 'entrance-copy', 2350)
    mark(
      findElement('#page-view .search-field', HTMLElement),
      'entrance-search',
      2450,
    )
    findElements('#page-view .product-card', HTMLElement).forEach(
      (card, index) =>
        mark(card, 'entrance-card', 2550 + Math.min(index, 11) * 50),
    )
    document.documentElement.dataset.entrance = 'playing'
    document.body.append(intro)
    intro.classList.add('is-playing')
    requireElement('.skip-intro', HTMLButtonElement, intro).focus({
      preventScroll: true,
    })
    document.addEventListener('focusin', onFocus)
  }

  return { start: startEntrance, stop: stopEntrance }
}
