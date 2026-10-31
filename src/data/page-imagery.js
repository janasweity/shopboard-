const photo = (name, alt) => ({
  image: '/images/editorial/' + name + '.jpg',
  alt,
})

export const homeHero = photo(
  'home-hero',
  'Sunlit living room with a cream linen sofa, walnut table, olive and blue accents, and a large circular window',
)
export const aboutMaterials = photo(
  'about-materials',
  'Linen, olive wool, travertine, curved glass and brushed brass samples arranged on walnut',
)
export const aboutCraft = photo(
  'about-craft',
  'Hands fitting an unfinished oak mortise-and-tenon joint beside wood shavings and a hand plane',
)

export const roomPhotography = {
  'soft-living': {
    ...photo(
      'room-soft-living',
      'Compact living room with olive modular seating, terracotta cushions, a round oak table and tall sash windows',
    ),
    description:
      'Balance olive seating with terracotta textiles, warm oak, and softly sculpted light for a room made for conversation.',
  },
  'open-living': {
    ...photo(
      'room-open-living',
      'Open loft viewed behind a charcoal sofa, with a dusty-blue rug, pale stone tables and double-height steel-framed windows',
    ),
    description:
      'Deep charcoal seating and generous natural textures create an inviting centre for an open home. Let dusty blue and ochre bring a little contrast.',
  },
  'natural-entry': {
    ...photo(
      'room-natural-entry',
      'Walnut entry bench, peg rail, bronze mirror, terracotta vase and woven basket beside a stair',
    ),
    description:
      'Layer warm wood, organic reflections, ceramics, and woven storage for a corner with quiet character. Leave everyday essentials a considered place of their own.',
  },
  'burgundy-living': {
    ...photo(
      'room-burgundy-living',
      'Evening reading room with burgundy leather seating, walnut bookshelves, a pleated lamp and a navy striped rug',
    ),
    description:
      'Balance rich burgundy leather with soft taupe, dark walnut, tactile stripes, and gentle evening light. A reading corner can set the mood for a whole room.',
  },
  'burgundy-bedroom': {
    ...photo(
      'room-bedroom',
      'Cream upholstered bed with burgundy linen, a navy blanket and blush cushions beside light-oak bedside tables',
    ),
    description:
      'Soften rich burgundy linen with warm cream, tactile fabrics, and gentle light. Blush accents and light oak make room for a slower start.',
  },
  'burgundy-dining': {
    ...photo(
      'room-dining',
      'Oval oak dining table with forest-green chairs, cream linen and amber glassware beside courtyard doors',
    ),
    title: 'Gather around warm wood.',
    description:
      'Layer green upholstery, glowing woven light, warm wood, and a generous oval table for everyday gathering. A little amber glass catches the afternoon sun.',
  },
  'ivory-kitchen': {
    ...photo(
      'room-kitchen',
      'Forest-green kitchen cabinets, ivory shelves, stone counters and an oak preparation island lit by a pantry window',
    ),
    description:
      'Bring forest-green cabinetry, warm ivory shelves, natural oak, woven light and tactile tableware together for a kitchen that feels like the heart of home.',
  },
}

export const bathroomRoom = {
  id: 'blue-bathroom',
  name: 'Bathroom',
  title: 'Everyday rituals. A quieter start.',
  ...photo(
    'room-bathroom',
    'Bathroom with blue-green shower tiles, pink plaster walls, a stone basin, walnut vanity and forest-green towels',
  ),
  description:
    'Bring stone, wood, woven texture and soft towels together. Dusty blue and a little pink make practical daily rituals feel more personal.',
  categories: ['bathroom'],
  collection: 'nature-form',
}
