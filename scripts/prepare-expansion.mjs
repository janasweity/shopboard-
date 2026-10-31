import { URL } from 'node:url'
import console from 'node:console'
import fs from 'node:fs'
import { retainedProducts } from '../src/data/retained-products.js'
import { curatedProducts } from '../src/data/curated-products.js'
import { expandedProducts } from '../src/data/expanded-products.js'

const read = (path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'))
const reviewed = new Set(read('./catalogue-photo-review.json').accepted)
const jobs = [
  ...read('./catalogue-variant-briefs.json'),
  ...read('./new-product-variant-briefs.json'),
]
const products = [...retainedProducts, ...curatedProducts, ...expandedProducts]
const additionalVariants = {}
const finishIndependentMaterials = {
  'orbit-side-table': 'Tempered glass top, stainless-steel tubular base',
  'rill-glasses': 'Soda-lime glass',
  'balance-bookends':
    'Honed natural travertine; natural color and veining vary',
  'kinetic-mobile':
    'Metal rods and ovals, powder-coated steel curved discs, hanging cord',
}
const photos = expandedProducts.map((product) => ({
  source: `artifacts/catalogue-expansion/${product.id}-original.png`,
  target: `public/images/expansion/${product.id}-original.jpg`,
}))
const neutralMaterials = (materials) =>
  materials
    .replace(/\b(?:champagne|brass|bronze)-finished\s*/gi, '')
    .replace(
      /\b(?:forest green|muted blue|dusty blue|soft pink|butter cream|burgundy|cream|olive|taupe|beige|terracotta|navy|green|pink|ochre|charcoal|ivory|sand)\b\s*/gi,
      '',
    )
    .replace(/\s{2,}/g, ' ')
    .trim()

for (const job of jobs) {
  const key = `${job.product}/${job.id}`
  if (!reviewed.has(key)) continue
  const source = `artifacts/catalogue-expansion/${job.product}-${job.id}.png`
  if (
    !fs.existsSync(source) &&
    !fs.existsSync(`public/images/expansion/${job.product}-${job.id}.jpg`)
  )
    throw new Error(`Reviewed photo is missing: ${source}`)
  const product = products.find((product) => product.id === job.product)
  if (!product || product.variants.some((variant) => variant.id === job.id))
    throw new Error(`Invalid or duplicate variant: ${key}`)
  const name =
    job.product === 'ripple-mirror' && job.id === 'steel'
      ? 'Brushed aluminium frame'
      : job.name
  const variant = {
    id: job.id,
    name,
    hex: job.hex,
    image: `/images/expansion/${job.product}-${job.id}.jpg`,
    alt: product.photoSubject
      ? `${name}: ${product.photoSubject}`
      : `${product.name.replace(/Olive (?=Accent Chair|Table Lamp|Abstract Print)/g, '')} in ${name}`,
    price: product.price,
    available: true,
    availability: 'In stock',
    materials: `${name}; ${neutralMaterials(finishIndependentMaterials[product.id] || product.materials)}`,
    description: `${product.name} in ${name}. The same construction, dimensions and materials as the original design, shown in this photographed finish.`,
    photography: 'AI-generated reference-based finish edit',
  }
  ;(additionalVariants[product.id] ??= []).push(variant)
  photos.push({ source, target: 'public' + variant.image })
}
fs.writeFileSync(
  new URL('../src/data/additional-variants.js', import.meta.url),
  '// Only individually reviewed, locally saved finish photographs are offered.\nexport const additionalVariants = ' +
    JSON.stringify(additionalVariants, null, 2) +
    '\n',
)
fs.writeFileSync(
  new URL('./catalogue-accepted-photos.json', import.meta.url),
  JSON.stringify(photos, null, 2) + '\n',
)
console.log(
  `Prepared ${expandedProducts.length} new designs and ${photos.length - expandedProducts.length} reviewed finish photographs.`,
)
