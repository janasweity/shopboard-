import { heroSlides } from './data/hero-slides.js'

let initialized = false

export function initializeHeroSlider() {
  if (initialized) return
  initialized = true
  // Manual controls avoid unexpected motion and leave the visitor in control.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-hero-slide]')
    if (!button) return
    const hero = button.closest('.room-slider')
    const slide = heroSlides.find(
      (slide) => slide.id === button.dataset.heroSlide,
    )
    if (!hero || !slide) return
    hero.dataset.slide = slide.id
    hero.querySelector('h2').innerHTML = slide.title
    hero.querySelector('.eyebrow').textContent = slide.eyebrow
    hero.querySelector('.hero-description').textContent = slide.description
    const link = hero.querySelector('.hero-cta')
    link.href = slide.href
    link.innerHTML =
      'Explore the look' + ' <span aria-hidden="true">&nearr;</span>'
    const image = hero.querySelector('figure > img')
    image.src = slide.room.image
    image.alt = slide.room.alt
    image.width = slide.id === 'kitchen' ? 1672 : 1536
    image.height = slide.id === 'kitchen' ? 941 : 1024
    hero.querySelector('figcaption').textContent =
      slide.label.toUpperCase() + ' / RAHA'
    hero
      .querySelectorAll('[data-hero-slide]')
      .forEach((control) =>
        control.setAttribute('aria-pressed', String(control === button)),
      )
    hero.querySelector('.hero-slide-status').textContent =
      slide.label + ' inspiration selected.'
  })
}
