import type {
  Product,
  Collection,
  Room,
  Category,
} from '../modules/products/products.types.ts'

import { roomPhotography, bathroomRoom } from './page-imagery.ts'
import { kitchenCollection, kitchenRoom } from './kitchen.ts'
import { retainedProducts } from './retained-products.ts'
import { curatedProducts } from './curated-products.ts'
import { expandedProducts } from './expanded-products.ts'
import { additionalVariants } from './additional-variants.ts'

export const collections: Collection[] = [
  {
    id: 'nature-form',
    name: 'Nature & Form',
    image: '/images/collection/soft-living.webp',
    alt: 'Cream curved seating and olive accents around a travertine table in a natural sunlit living room',
    description: 'Cream curves, grounded olive, and natural texture.',
    tone: 'olive',
  },
  {
    id: 'burgundy-butter',
    name: 'Burgundy & Butter Cream',
    image: '/images/burgundy/burgundy-living.webp',
    alt: 'Butter-cream curved sofa and burgundy leather chair beside a veined burgundy marble table, brass accents, and decorative branches',
    description: 'Rich burgundy, soft cream, warm wood, and stone.',
    tone: 'burgundy',
  },
  kitchenCollection,
]
export const categories: ['all' | Category, string][] = [
  ['all', 'All products'],
  ['living-room', 'Living Room'],
  ['kitchen-dining', 'Kitchen & Dining'],
  ['bedroom', 'Bedroom'],
  ['bathroom', 'Bathroom'],
  ['home-decor', 'Home Decor'],
]
export const categoryAliases: Partial<Record<string, Category>> = {
  seating: 'living-room',
  tables: 'living-room',
  storage: 'living-room',
  lighting: 'living-room',
  rugs: 'living-room',
  decor: 'home-decor',
  art: 'home-decor',
  plants: 'home-decor',
  bedroom: 'bedroom',
  'kitchen-dining': 'kitchen-dining',
}
export const retiredProducts: Partial<Record<string, Category>> = {
  'cloud-pendant': 'living-room',
  'grove-sideboard': 'living-room',
  'haven-sectional': 'living-room',
  'claret-chair': 'living-room',
  'butter-sofa': 'living-room',
  'merlot-table': 'living-room',
  'creme-stool': 'living-room',
  'glaze-lamp': 'living-room',
  'pietra-bowl': 'home-decor',
  'tavola-table': 'living-room',
  'butter-dome': 'living-room',
  'wine-art': 'home-decor',
  'branch-vase': 'home-decor',
  'reed-rattan-pendant': 'kitchen-dining',
  'haven-linen-stool': 'kitchen-dining',
  'grove-utensil-holder': 'kitchen-dining',
  'terra-serving-bowls': 'kitchen-dining',
  'terra-dinner-plates': 'kitchen-dining',
  'terra-stoneware-mugs': 'kitchen-dining',
  'curve-kitchen-vase': 'kitchen-dining',
  'weave-seagrass-placemats': 'kitchen-dining',
  'sprig-herb-planter': 'kitchen-dining',
}
const roomData: Room[] = [
  {
    id: 'soft-living',
    name: 'Soft living',
    title: 'Curves, calm, and conversation.',
    image: '/images/collection/soft-living.webp',
    alt: 'Cream curved sofa and olive chairs around a travertine table with neutral art, textured rug, and sculptural lighting',
    description:
      'Balance cream curves with grounded olive seating, warm stone, and softly sculpted light.',
    categories: ['living-room'],
    collection: 'nature-form',
  },
  {
    id: 'open-living',
    name: 'Open-plan living',
    title: 'Space to gather. Room to breathe.',
    image: '/images/collection/open-living.webp',
    alt: 'Spacious double-height living room with a cream corner sofa, rounded stone table, layered rugs, and tall sunlit windows',
    description:
      'Deep modular seating and generous natural textures create an inviting centre for an open home.',
    categories: ['living-room'],
    collection: 'nature-form',
  },
  {
    id: 'natural-entry',
    name: 'Natural corners',
    title: 'A quieter kind of welcome.',
    image: '/images/collection/natural-entry.webp',
    alt: 'Wavy mirror, broad-leaf plant, dark fluted walnut sideboard, olive lamp, and ceramic vase in a warm interior corner',
    description:
      'Layer dark wood, organic reflections, ceramics, and leafy shapes for a corner with quiet character.',
    categories: ['home-decor'],
    collection: 'nature-form',
  },
  {
    id: 'burgundy-living',
    name: 'Burgundy living',
    title: 'A richer shade of everyday.',
    image: '/images/burgundy/burgundy-living.webp',
    alt: 'Butter-cream curved sofa and burgundy leather chair beside a veined burgundy marble table, brass accents, and decorative branches',
    description:
      'Balance butter-cream curves with rich leather, dark walnut, burgundy marble, and warm brass details.',
    categories: ['living-room'],
    collection: 'burgundy-butter',
  },
  {
    id: 'burgundy-dining',
    name: 'Warm dining',
    title: 'Gather around warm stone.',
    image: '/images/burgundy/burgundy-dining.webp',
    alt: 'Warm wood kitchen with cream upholstered stools, dome pendants, burgundy marble island, and round travertine dining table',
    description:
      'Layer cream upholstery, glowing domes, warm wood, and a generous round stone table for everyday gathering.',
    categories: ['kitchen-dining'],
    collection: 'burgundy-butter',
  },
  {
    id: 'burgundy-bedroom',
    name: 'Burgundy bedroom',
    title: 'Slow evenings. Deeper colours.',
    image: '/images/burgundy/burgundy-bedroom.webp',
    alt: 'Cream upholstered bed with burgundy linen bedding and cushions, dark walnut bedside tables, abstract art, and a glossy burgundy lamp',
    description:
      'Soften rich burgundy linen with warm cream, tactile velvet, and gentle evening light.',
    categories: ['bedroom'],
    collection: 'burgundy-butter',
  },
  kitchenRoom,
  bathroomRoom,
]
export const rooms: Room[] = roomData.map((room) => ({
  ...room,
  ...(roomPhotography[room.id] || {}),
}))
const catalogue = [
  ...retainedProducts,
  ...curatedProducts,
  ...expandedProducts,
].map<Product>((product) => ({
  ...product,
  variants: [
    product.variants[0],
    ...product.variants.slice(1),
    ...(additionalVariants[product.id] || []),
  ],
}))
const firstLooks = [
  'arc-sofa',
  'gem-goblets',
  'hammam-towels',
  'flora-duvet',
  'facet-glass-vase',
  'cadence-lumbar',
]
export const products: Product[] = [
  ...firstLooks.map((id) => {
    const product = catalogue.find((product) => product.id === id)
    if (!product) throw new Error('Unknown featured product: ' + id)
    return product
  }),
  ...catalogue.filter((product) => !firstLooks.includes(product.id)),
]
export const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value,
  )
export const productURL = (id: string) =>
  '/?page=product&id=' + encodeURIComponent(id)
export const categoryName = (id?: string | null) =>
  categories.find(([key]) => key === id)?.[1] || 'Homeware'
export const collectionName = (id?: string | null) =>
  collections.find((collection) => collection.id === id)?.name ||
  'The collection'
export const getVariant = (product: Product, id?: string | null) =>
  product.variants.find((variant) => variant.id === id) || product.variants[0]
