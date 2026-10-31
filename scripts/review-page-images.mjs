import fs from 'node:fs'
import console from 'node:console'
import { products } from '../src/data/catalog.js'

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const review = read('scripts/page-image-review.json')
const accepted = new Set(review.galleryAccepted)
const jobs = read('scripts/product-gallery-briefs.json')
const rows = []
for (const product of products) {
  const planned = jobs.filter((job) => job.product === product.id)
  if (planned.every((job) => accepted.has(product.id + '/' + job.id))) continue
  if (
    !planned.every((job) =>
      fs.existsSync(`artifacts/page-imagery/${product.id}-${job.id}.png`),
    )
  )
    continue
  rows.push({
    id: product.id,
    keys: planned.map((job) => product.id + '/' + job.id),
    photos: [
      { name: product.variants[0].name, path: 'public' + product.image },
      ...planned.map((job) => ({
        name: job.label,
        path: `artifacts/page-imagery/${product.id}-${job.id}.png`,
      })),
    ],
  })
}
fs.writeFileSync(
  'artifacts/page-imagery/gallery-review-ready.json',
  JSON.stringify(rows, null, 2) + '\n',
)
console.log(JSON.stringify(rows.map((row) => row.id)))
