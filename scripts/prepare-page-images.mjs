import fs from 'node:fs'
import console from 'node:console'
import { products } from '../src/data/catalog.js'

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const review = read('scripts/page-image-review.json')
const galleryJobs = read('scripts/product-gallery-briefs.json')
const editorialJobs = read('scripts/page-imagery-briefs.json')
const photos = []
const galleries = {}
for (const id of review.editorialAccepted) {
  if (!editorialJobs.some((job) => job.id === id))
    throw new Error('Unknown editorial photo: ' + id)
  photos.push({
    source: `artifacts/page-imagery/${id}.png`,
    target: `public/images/editorial/${id}.jpg`,
  })
}
for (const key of review.galleryAccepted) {
  const job = galleryJobs.find((job) => job.product + '/' + job.id === key)
  if (!job) throw new Error('Unknown product photograph: ' + key)
  const product = products.find((product) => product.id === job.product)
  const variant = product.variants.find((variant) => variant.id === job.finish)
  const image = `/images/galleries/${product.id}-${job.id}.jpg`
  const source = `artifacts/page-imagery/${product.id}-${job.id}.png`
  if (!fs.existsSync(source) && !fs.existsSync('public' + image))
    throw new Error('Missing reviewed photograph: ' + key)
  const gallery = (galleries[product.id] ??= { finish: variant.id, views: [] })
  gallery.views.push({
    id: job.id,
    label: job.label,
    image,
    alt:
      job.id === 'detail'
        ? `Material and construction detail of ${product.name} in ${variant.name}`
        : job.id === 'angle'
          ? `${product.name} in ${variant.name}, shown from an additional angle`
          : `${product.name} in ${variant.name}, styled in a relevant home setting`,
  })
  photos.push({ source, target: 'public' + image })
}
const order = ['angle', 'detail', 'lifestyle']
for (const gallery of Object.values(galleries))
  gallery.views.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
fs.writeFileSync(
  'src/data/product-gallery-images.js',
  '// Reviewed product-specific views; each set is tied to its photographed finish.\nexport const productGalleryImages = ' +
    JSON.stringify(galleries, null, 2) +
    '\n',
)
fs.writeFileSync(
  'scripts/accepted-page-photos.json',
  JSON.stringify(photos, null, 2) + '\n',
)
console.log({
  editorial: review.editorialAccepted.length,
  gallery: review.galleryAccepted.length,
})
