import { homeHero, aboutMaterials, aboutCraft } from './data/page-imagery.js'
import { getProductGallery } from './product-gallery.js'
import { heroSlides } from './data/hero-slides.js'
import { shopRoom } from './data/shop-room.js'

import {
  products,
  getVariant,
  collectionName,
  collections,
  rooms,
  categories,
  money,
  productURL,
  categoryName,
} from './data.js'

export const routeLink = (href, text, className = '') =>
  `<a data-route href="${href}" class="${className}">${text}</a>`
export const image = (src, alt, eager = false, className = '') =>
  `<img src="${src}" alt="${alt}" width="1400" height="1000" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" class="${className}" />`

export function card(product, featured = false) {
  return `<article class="product-card ${featured ? 'featured' : ''}" data-id="${product.id}" data-category="${product.category}" data-collection="${product.collection}"><a class="product-image" data-route href="${productURL(product.id)}" aria-label="View ${product.name}">${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}${image(product.image, product.alt)}</a><div class="product-info"><p class="product-type">${collectionName(product.collection)} / ${categoryName(product.category)}</p><h3>${routeLink(productURL(product.id), product.name)}</h3><p class="product-detail">${product.description.split('. ')[0]}.</p><p class="product-price">${money(product.price)}</p><p class="color-option-count">${product.variants.length} ${product.variants.length === 1 ? 'color / finish' : 'colors &amp; finishes'}</p><button type="button" class="add-to-cart" data-product="${product.id}" aria-label="Add ${product.name} to cart">Add to cart <span aria-hidden="true">＋</span></button></div></article>`
}

function roomProduct(item) {
  const product = products.find((product) => product.id === item.id)
  const variant = product.variants.find((variant) => variant.id === item.color)
  return {
    product,
    variant,
    href: productURL(product.id) + '&color=' + encodeURIComponent(variant.id),
  }
}

function shopTheRoom() {
  const first = roomProduct(shopRoom.items[0])
  return `<section class="shop-the-room page-section" aria-labelledby="shop-room-title"><div class="section-heading"><div><p class="eyebrow">RAHA / THE CONSIDERED HOME</p><h2 id="shop-room-title">Shop the Room</h2></div><p id="shop-room-subtitle">A considered space. Discover every detail.</p></div><div class="shop-room-scene"><img class="shop-room-photo" src="${shopRoom.image}" alt="${shopRoom.alt}" width="1536" height="1024" loading="lazy" decoding="async" />${shopRoom.items
    .map((item, index) => {
      const { product, variant } = roomProduct(item)
      return `<button type="button" class="room-hotspot" data-room-hotspot="${item.id}" data-room-color="${variant.id}" style="--hotspot-x: ${item.x}%; --hotspot-y: ${item.y}%" aria-label="Discover ${product.name} in ${variant.name}" aria-expanded="false" aria-controls="shop-room-panel" aria-haspopup="dialog"><span aria-hidden="true">${index + 1}</span><span class="room-hotspot-label" aria-hidden="true">${item.label}</span></button>`
    })
    .join(
      '',
    )}<div id="shop-room-panel" class="room-product-panel" role="dialog" aria-modal="false" aria-labelledby="room-panel-title" hidden><button type="button" data-room-close class="room-panel-close" aria-label="Close product panel">&times;</button>${image(first.variant.image, first.variant.alt)}<div><h3 id="room-panel-title">${first.product.name}</h3><p class="room-panel-color">${first.variant.name}</p><p class="room-panel-price">${money(first.variant.price)}</p>${routeLink(first.href, 'View product &nearr;', 'text-link')}</div></div></div><ul class="room-mobile-list" aria-label="Products in this room">${shopRoom.items
    .map((item) => {
      const { product, variant, href } = roomProduct(item)
      return `<li>${image(variant.image, variant.alt)}<div><h3>${product.name}</h3><p>${variant.name} / ${money(variant.price)}</p><a data-route data-room-link="${product.id}" href="${href}" class="text-link">View product <span aria-hidden="true">&nearr;</span></a></div></li>`
    })
    .join('')}</ul></section>`
}

const featuredIds = [
  'arc-sofa',
  'gem-goblets',
  'hammam-towels',
  'flora-duvet',
  'facet-glass-vase',
  'cadence-lumbar',
]

const home =
  () => `<section class="hero home-hero" id="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">RAHA / THE CONSIDERED HOME</p><h1 id="hero-title">Beautiful pieces.<br />A home that<br /><em>feels like you.</em></h1><p class="hero-description">Considered furniture, warm textures, and little details that bring your everyday into balance.</p>${routeLink('/?page=products', 'Explore the collection <span aria-hidden="true">&nearr;</span>', 'button hero-cta')}<p class="hero-footnote">Thoughtfully chosen. Naturally at home.</p></div><figure>${image(homeHero.image, homeHero.alt, true)}<figcaption>RAHA / HOME &amp; LIVING</figcaption></figure></section><section class="page-section featured-section" id="products" aria-labelledby="bestsellers-title"><div class="section-heading"><div><p class="eyebrow">FAVOURITES FROM OUR LIVING COLLECTIONS</p><h2 id="bestsellers-title">Soft forms. Grounded living.</h2></div>${routeLink('/?page=products', 'View all products <span aria-hidden="true">&nearr;</span>', 'text-link')}</div><div class="product-grid">${products
    .filter((product) => featuredIds.includes(product.id))
    .map((p) => card(p))
    .join(
      '',
    )}</div><p class="collection-footnote">Concept collection: product specifications and prices are illustrative.</p></section>
<section class="room-slider page-section" id="room-inspiration" data-slide="living" aria-labelledby="room-slider-title">
<div class="hero-copy"><p class="eyebrow">${heroSlides[0].eyebrow}</p><h2 id="room-slider-title">${heroSlides[0].title}</h2><p class="hero-description">${heroSlides[0].description}</p>${routeLink(heroSlides[0].href, 'Explore the look' + ' <span aria-hidden="true">&nearr;</span>', 'button hero-cta')}<div class="hero-controls" role="group" aria-label="Choose a room">${heroSlides.map((slide, index) => `<button type="button" data-hero-slide="${slide.id}" aria-controls="room-inspiration" aria-pressed="${index === 0}">${slide.label}</button>`).join('')}</div><p class="hero-slide-status visually-hidden" role="status" aria-live="polite"></p></div><figure>${image(heroSlides[0].room.image, heroSlides[0].room.alt)}<figcaption>LIVING ROOM / RAHA</figcaption></figure></section>
`

const catalog = () =>
  `<section class="page-intro"><p class="eyebrow">FIVE ROOMS / ONE CONSIDERED HOME</p><h1>Find your everyday favourites.</h1><p>${products.length} considered pieces. So many ways to make them yours.</p></section><section aria-label="Product catalogue"><div class="search-field"><label for="product-search">Find something for your home</label><div class="search-input"><span aria-hidden="true">⌕</span><input id="product-search" type="search" placeholder="Search product names…" autocomplete="off" /><button id="clear-search" type="button" aria-label="Clear search" hidden>×</button></div></div><div class="product-tools"><div class="catalogue-selects"><div class="catalogue-control"><label for="category-filter">Category</label><select id="category-filter">${categories.map(([id, name]) => `<option value="${id}">${id === 'all' ? 'All categories' : name}</option>`).join('')}<optgroup label="Collections">${collections.map(({ id, name }) => `<option value="collection:${id}">${name}</option>`).join('')}</optgroup></select></div><div class="catalogue-control"><label for="price-sort">Sort by price</label><select id="price-sort"><option value="default">Default order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div></div><p id="product-count" role="status" aria-live="polite">${products.length} of ${products.length} products</p></div><div class="product-grid" id="catalog-grid"></div><p id="empty-products" class="empty-state" hidden>No products match these selections. Try a shorter product name, choose All categories, or reset the filters.</p><button type="button" id="reset-filters" class="text-button">Reset search and filters</button><p class="collection-footnote">A concept furniture store. Product photos illustrate the collection; names, specifications and prices are concept content.</p></section>`

export function galleryOptions(product, variant) {
  const views = getProductGallery(product, variant)
  const original = product.variants[0]
  const hasAdditionalViews = getProductGallery(product, original).length > 1
  return `<div class="gallery-thumbnails" role="group" aria-label="Product image gallery">${views.map((view) => `<button type="button" data-gallery="${view.id}" aria-pressed="${view.id === 'product'}" aria-label="Show ${product.name} ${view.id === 'product' ? 'product photo' : view.label.toLowerCase()}">${image(view.image, '')}<span>${view.label}</span></button>`).join('')}</div>${hasAdditionalViews && variant.id !== original.id ? `<p class="gallery-note">Additional photographs are available in ${original.name}. ${routeLink(productURL(product.id) + '&color=' + encodeURIComponent(original.id), 'View those photographs', 'text-link')}</p>` : hasAdditionalViews ? '<p class="gallery-note">Additional views show this product in the photographed finish.</p>' : '<p class="gallery-note">Only the product photograph is available for this finish.</p>'}`
}

function colorOptions(product, selected) {
  return `<fieldset class="color-options"><legend>Color / finish</legend><p id="selected-color" aria-live="polite">Selected: <strong>${selected.name}</strong></p><div class="color-swatches">${product.variants.map((variant) => `<button type="button" class="color-swatch" data-color="${variant.id}" aria-pressed="${variant.id === selected.id}"><span class="swatch-dot" style="--swatch-color: ${variant.hex}" aria-hidden="true"></span><span>${variant.name}</span><span class="swatch-check" aria-hidden="true" ${variant.id === selected.id ? '' : 'hidden'}>Selected</span>${variant.available ? '' : '<span class="swatch-stock">Out of stock</span>'}</button>`).join('')}</div></fieldset>`
}

function detail(id, colorId) {
  const product = products.find((p) => p.id === id)
  if (!product)
    return {
      title: 'Product not found',
      markup: `<section class="page-intro"><p class="eyebrow">LET'S FIND YOUR WAY HOME</p><h1>We couldn't find that product.</h1><p>It may be an old link. The whole collection is waiting here.</p>${routeLink('/?page=products', 'Explore the products ↗', 'button')}</section>`,
    }
  const variant = getVariant(product, colorId)
  return {
    title: product.name,
    markup: `<nav class="breadcrumbs" aria-label="Breadcrumb">${routeLink('/', 'Home')}<span aria-hidden="true">/</span>${routeLink('/?page=products', 'Products')}<span aria-hidden="true">/</span><span aria-current="page">${product.name}</span></nav><section class="product-layout"><div class="product-gallery"><figure><img id="gallery-image" src="${variant.image}" alt="${variant.alt}" width="1400" height="1000" fetchpriority="high" /><figcaption id="gallery-caption">${product.name} / ${variant.name} / product photograph</figcaption></figure>${colorOptions(product, variant)}<div id="gallery-options">${galleryOptions(product, variant)}</div></div><div class="detail-copy"><p class="eyebrow">${categoryName(product.category).toUpperCase()} / RAHA</p><h1>${product.name}</h1>${routeLink('/?page=products&collection=' + product.collection, collectionName(product.collection), 'text-link detail-collection')}<div class="variant-summary" aria-live="polite"><p class="detail-price">${money(variant.price)}</p><p id="variant-availability">${variant.availability}</p></div><p class="variant-demo-note">Illustrative availability for this local demo.</p><p class="detail-description">${variant.description}</p><button type="button" class="button detail-add" data-product="${product.id}" data-variant="${variant.id}" aria-describedby="variant-availability" ${variant.available ? '' : 'disabled'}>Add ${product.name} to cart <span aria-hidden="true">＋</span></button><dl class="specifications"><div><dt>Dimensions</dt><dd>${product.dimensions}</dd></div><div><dt>Materials</dt><dd id="variant-materials">${variant.materials}</dd></div><div><dt>Care</dt><dd>${product.care || (product.category === 'bedroom' ? 'Follow the sewn-in care label. Remove cushion inserts before cleaning covers, and avoid direct heat.' : product.category === 'decor' || product.category === 'seating' ? 'Dust gently or spot-clean with a soft cloth. Avoid harsh cleaners and prolonged direct sunlight.' : 'Wipe gently with a soft, slightly damp cloth and dry promptly. Avoid abrasive cleaners.')}</dd></div></dl><p class="collection-footnote">Illustrative product specifications. Local demo cart only; no checkout or order is created.</p>${routeLink('/?page=products', '← Back to all products', 'text-link')}</div></section>`,
  }
}

const inspiration = () =>
  `<section class="page-intro"><p class="eyebrow">NATURAL ROOMS. ENDLESS POSSIBILITIES.</p><h1>A little inspiration.<br />A lot of you.</h1><p>Good rooms start with the way you live. Find a feeling, then make it your own.</p><nav class="room-nav" aria-label="Room sections">${rooms.map((r) => `<a href="#${r.id}">${r.name} ↓</a>`).join('')}</nav></section>${rooms.map((r, i) => `<section class="room-story" id="${r.id}" aria-labelledby="${r.id}-title"><figure>${image(r.image, r.alt, i === 0)}<figcaption>RAHA / ${r.name.toUpperCase()} INSPIRATION</figcaption></figure><div><p class="eyebrow">0${i + 1} / ${r.name.toUpperCase()}</p><h2 id="${r.id}-title">${r.title}</h2><p>${r.description}</p>${routeLink('/?page=products&category=' + r.categories[0] + '&collection=' + r.collection, `Explore ${categoryName(r.categories[0]).toLowerCase()} ↗`, 'button')}</div></section>`).join('')}${shopTheRoom()}<section id="planning" class="planner page-section"><p class="eyebrow">A GOOD PLACE TO START</p><h2>Plan your room.</h2><p>Measure your room to estimate its floor area. Check furniture dimensions and leave space for walkways before choosing your layout.</p><form id="room-planner"><div><label for="room-width">Width (metres)</label><input id="room-width" type="number" min="0.5" max="50" step="0.1" required placeholder="4.0" /></div><div><label for="room-length">Length (metres)</label><input id="room-length" type="number" min="0.5" max="50" step="0.1" required placeholder="5.0" /></div><button type="submit" class="button">Calculate room area ↗</button></form><output id="room-area" for="room-width room-length" aria-live="polite">Enter your measurements to get started.</output></section>`

const about = () =>
  `<section class="page-intro"><p class="eyebrow">HELLO, WE'RE RAHA.</p><h1>Thoughtful design.<br />Everyday possibilities.</h1><p>An independent concept store for people making a place of their own.</p></section><section class="about-story" id="store-information" aria-labelledby="about-title">${image(aboutMaterials.image, aboutMaterials.alt, true)}<div><h2 id="about-title">A little more feeling at home.</h2><p>We believe a home should feel lived in, loved, and completely yours. Our concept collection brings together comfortable furniture, warm lighting, useful storage, and small everyday details.</p><p>Scandinavian simplicity is our starting point. Natural textures, quiet colours, warm wood, and tactile fabrics create room for everyday life. Browse the catalogue, check dimensions and materials, and leave room to move. What you do with it is up to you.</p><p>This is an online demonstration store, with no physical shop, real accounts, payments, or order fulfilment.</p></div></section><section class="contact-section page-section" aria-labelledby="contact-title"><div><p class="eyebrow">LET'S START A CONVERSATION</p><h2 id="contact-title">About your next idea.</h2><p>This contact form is a local demo. Use made-up details. No message is sent, and nothing you enter is stored.</p><section id="returns" aria-labelledby="returns-title"><h3 id="returns-title">Returns & support</h3><p>No purchases are processed in this demo, so there are no deliveries or returns to arrange. You can change or remove local cart items at any time.</p></section><figure class="contact-detail-image">${image(aboutCraft.image, aboutCraft.alt)}<figcaption>CRAFT STUDY / CONCEPT PHOTOGRAPHY</figcaption></figure></div><form id="contact-form"><div class="form-field"><label for="contact-name">Your name</label><input id="contact-name" required autocomplete="off" /></div><div class="form-field"><label for="contact-email">Email address</label><input id="contact-email" type="email" required autocomplete="off" /></div><div class="form-field"><label for="contact-topic">What's on your mind?</label><select id="contact-topic" required><option value="">Choose a topic</option><option>Product information</option><option>Room planning</option><option>General question</option></select></div><div class="form-field"><label for="contact-message">Your message</label><textarea id="contact-message" rows="5" required minlength="10" aria-describedby="contact-help"></textarea><p id="contact-help">At least 10 characters. This demo will not send your message.</p></div><button type="submit" class="button">Try contact demo ↗</button><p id="contact-status" role="status" aria-live="polite"></p></form></section>`

export function getPage(page, id, colorId) {
  if (page === 'product') return detail(id, colorId)
  if (page === 'products') return { title: 'Products', markup: catalog() }
  if (page === 'inspiration')
    return { title: 'Room inspiration', markup: inspiration() }
  if (page === 'about') return { title: 'About & Contact', markup: about() }
  if (page === 'home') return { title: 'Make room for living', markup: home() }
  return {
    title: 'Page not found',
    markup: `<section class="page-intro"><h1>This page isn't here.</h1>${routeLink('/', 'Back to Home ↗', 'button')}</section>`,
  }
}
