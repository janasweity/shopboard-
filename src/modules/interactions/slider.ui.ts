import { requireElement, findElements } from '../../shared/ui/dom.ts'
import { heroSlides } from '../../data/hero-slides.ts'

export function initializeHeroSlider() {
  // Manual controls avoid unexpected motion and leave the visitor in control.
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest<HTMLButtonElement>('button[data-hero-slide]')
    if (!button) return
    const hero = button.closest('.room-slider')
    const slide = heroSlides.find(
      (slide) => slide.id === button.dataset.heroSlide,
    )
    if (!(hero instanceof HTMLElement) || !slide) return
    hero.dataset.slide = slide.id
    requireElement('h2', HTMLElement, hero).innerHTML = slide.title
    requireElement('.eyebrow', HTMLElement, hero).textContent = slide.eyebrow
    requireElement('.hero-description', HTMLElement, hero).textContent =
      slide.description
    const link = requireElement('.hero-cta', HTMLAnchorElement, hero)
    link.href = slide.href
    link.innerHTML =
      'Explore the look' + ' <span aria-hidden="true">&nearr;</span>'
    const image = requireElement('figure > img', HTMLImageElement, hero)
    image.src = slide.room.image
    image.alt = slide.room.alt
    image.width = slide.id === 'kitchen' ? 1672 : 1536
    image.height = slide.id === 'kitchen' ? 941 : 1024
    requireElement('figcaption', HTMLElement, hero).textContent =
      slide.label.toUpperCase() + ' / RAHA'
    findElements('[data-hero-slide]', HTMLElement, hero).forEach((control) =>
      control.setAttribute('aria-pressed', String(control === button)),
    )
    requireElement('.hero-slide-status', HTMLElement, hero).textContent =
      slide.label + ' inspiration selected.'
  })
}
