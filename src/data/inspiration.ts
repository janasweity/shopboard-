import type { InspirationRoom } from '../modules/products/products.types.ts'

// Dedicated to Room Inspiration; other pages retain their own photography.
export const inspirationRooms: InspirationRoom[] = [
  {
    id: 'living-room',
    name: 'Living room',
    title: 'Soft curves. Space for everyday life.',
    description:
      'Cream boucle, olive upholstery and sand travertine bring a quiet warmth to a compact living room. Leave comfortable space between the seating and coffee table.',
    image: '/images/inspiration/living-room.webp',
    alt: 'Cream ARC curved sofa, sand travertine DUNE coffee table and olive MOSS chair in a modest daylight living room',
    items: [
      { id: 'arc-sofa', color: 'original' },
      { id: 'dune-table', color: 'original' },
      { id: 'moss-chair', color: 'original' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    title: 'Rich linen. A slower start.',
    description:
      'Burgundy washed linen meets warm walnut and a muted blue bedside lamp. Keep the bedside surface simple and allow room to move around the bed.',
    image: '/images/inspiration/bedroom.webp',
    alt: 'Burgundy ROUGE linen bedding beside a walnut NOOK bedside table and blue and ivory PLEAT lamp in a simple daylight bedroom',
    items: [
      { id: 'rouge-bedding', color: 'original' },
      { id: 'nook-bedside', color: 'original' },
      { id: 'pleat-lamp', color: 'original' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    title: 'Useful things. A little morning colour.',
    description:
      'Natural oak boards, clear storage jars and soft pink mugs make an everyday kitchen corner feel considered. Keep your worktop clear for preparing and serving.',
    image: '/images/inspiration/kitchen.webp',
    alt: 'Two natural oak GRAIN cutting boards, three clear PANTRY jars with acacia lids and two soft pink PETAL mugs on a naturally lit kitchen worktop',
    items: [
      { id: 'grain-oak-boards', color: 'original' },
      { id: 'pantry-jars', color: 'original' },
      { id: 'petal-mugs', color: 'original' },
    ],
  },
]
