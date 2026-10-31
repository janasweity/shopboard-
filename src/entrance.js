const sessionKey = 'raha-entrance-seen'
let cleanup = () => {}
export function stopEntrance() {
  cleanup()
}

export function startEntrance() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const url = new URL(location.href)
  const replay = url.searchParams.get('intro') === 'replay'
  if (replay) {
    url.searchParams.delete('intro')
    history.replaceState(null, '', url)
  }
  try {
    if (!replay && sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')
  } catch {
    return
  }
  if (reducedMotion.matches) return

  // Created only after the app renders. CSS never hides the underlying page.
  const intro = document.createElement('section')
  intro.className = 'store-intro'
  intro.setAttribute('aria-labelledby', 'intro-title')
  intro.innerHTML =
    '<div class="intro-brand"><p class="intro-kicker">MAKE ROOM FOR LIVING</p><p id="intro-title">RAHA<span>HOME &amp; LIVING</span></p><span class="intro-line" aria-hidden="true"></span></div><button type="button" class="skip-intro">Skip intro <span aria-hidden="true">↗</span></button>'
  const targets = []
  const mark = (element, className, delay) => {
    if (!element) return
    element.classList.add(className)
    element.style.setProperty('--entrance-delay', `${delay}ms`)
    targets.push([element, className])
  }
  const onMotionChange = (event) => {
    if (event.matches) stopEntrance()
  }
  const onEscape = (event) => {
    if (event.key === 'Escape') stopEntrance()
  }
  const onFocus = (event) => {
    if (!intro.contains(event.target)) stopEntrance()
  }
  const timer = window.setTimeout(stopEntrance, 3750)
  cleanup = () => {
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
    cleanup = () => {}
    if (restoreFocus)
      document.querySelector('#main-content').focus({ preventScroll: true })
  }
  intro.querySelector('.skip-intro').addEventListener('click', stopEntrance)
  reducedMotion.addEventListener('change', onMotionChange)
  document.addEventListener('keydown', onEscape)
  mark(document.querySelector('.home-hero figure > img'), 'entrance-hero', 2100)
  mark(document.querySelector('#page-view h1'), 'entrance-copy', 2350)
  mark(
    document.querySelector('#page-view .search-field'),
    'entrance-search',
    2450,
  )
  document
    .querySelectorAll('#page-view .product-card')
    .forEach((card, index) =>
      mark(card, 'entrance-card', 2550 + Math.min(index, 11) * 50),
    )
  document.documentElement.dataset.entrance = 'playing'
  document.body.append(intro)
  intro.classList.add('is-playing')
  intro.querySelector('.skip-intro').focus({ preventScroll: true })
  document.addEventListener('focusin', onFocus)
}
