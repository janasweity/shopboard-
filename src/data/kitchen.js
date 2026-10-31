const root = '/images/kitchen/'

export const kitchenCollection = {
  id: 'kitchen-dining',
  name: 'Kitchen & Dining',
  image: root + 'kitchen-scene.png',
  alt: 'Warm ivory kitchen with oak countertops, a fluted island, woven rattan pendants, beige bar stools, ceramics, and greenery',
  description:
    'Ivory, oak, woven light, and everyday rituals around the table.',
  tone: 'ivory',
}

export const kitchenRoom = {
  id: 'ivory-kitchen',
  name: 'Kitchen & Dining',
  title: 'Warm light. Everyday gathering.',
  image: kitchenCollection.image,
  alt: kitchenCollection.alt,
  description:
    'Bring warm ivory cabinetry, natural wood, woven pendants, softly upholstered stools, and tactile tableware together for a kitchen that feels like the heart of home.',
  categories: ['kitchen-dining'],
  collection: 'kitchen-dining',
}
