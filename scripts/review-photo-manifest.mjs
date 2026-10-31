import { URL } from 'node:url'
import console from 'node:console'
import fs from 'node:fs'

const read = (file) =>
  JSON.parse(fs.readFileSync(new URL(file, import.meta.url), 'utf8'))
const baseline = read('./catalogue-expansion-baseline.json')
const briefs = read('./catalogue-expansion-briefs.json')
const jobs = [
  ...read('./catalogue-variant-briefs.json'),
  ...read('./new-product-variant-briefs.json'),
]
const review = fs.existsSync(
  new URL('./catalogue-photo-review.json', import.meta.url),
)
  ? read('./catalogue-photo-review.json')
  : { accepted: [], rejected: [] }
const accepted = new Set(review.accepted)
const rejected = new Set(
  review.rejected.map((item) => (typeof item === 'string' ? item : item.key)),
)
const rows = []
for (const product of [...baseline, ...briefs]) {
  const variants = jobs.filter((job) => job.product === product.id)
  if (
    variants.every(
      (job) =>
        accepted.has(product.id + '/' + job.id) ||
        rejected.has(product.id + '/' + job.id),
    )
  )
    continue
  if (
    !variants.every((job) =>
      fs.existsSync(
        `artifacts/catalogue-expansion/${product.id}-${job.id}.png`,
      ),
    )
  )
    continue
  const originals = product.variants?.[0]?.image
    ? product.variants.map((variant) => ({
        name: variant.name,
        path: 'public' + variant.image,
      }))
    : [
        {
          name: product.finish,
          path: `artifacts/catalogue-expansion/${product.id}-original.png`,
        },
      ]
  rows.push({
    id: product.id,
    keys: variants.map((job) => product.id + '/' + job.id),
    photos: [
      ...originals,
      ...variants.map((job) => ({
        name: job.name,
        path: `artifacts/catalogue-expansion/${product.id}-${job.id}.png`,
      })),
    ],
  })
}
fs.writeFileSync(
  new URL(
    '../artifacts/catalogue-expansion/review-ready.json',
    import.meta.url,
  ),
  JSON.stringify(rows, null, 2) + '\n',
)
console.log(
  JSON.stringify(
    rows.map((row) => ({ id: row.id, variants: row.keys.length })),
  ),
)
