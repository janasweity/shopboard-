// Transport contract. Prices are integer USD cents, independent of UI types.
export interface ApiVariant {
  id: string
  name: string
  hex: string
  image: string
  alt: string
  price: number
  available: boolean
  availability: string
  materials: string
  description: string
  photography?: string
}

export interface ApiProduct {
  id: string
  name: string
  category:
    'living-room' | 'kitchen-dining' | 'bedroom' | 'bathroom' | 'home-decor'
  collection: 'nature-form' | 'burgundy-butter' | 'kitchen-dining'
  price: number
  image: string
  alt: string
  description: string
  dimensions: string
  materials: string
  variants: [ApiVariant, ...ApiVariant[]]
  categories?: ApiProduct['category'][]
  tag?: string
  room?: string
  care?: string
  photography?: string
  photoSubject?: string
  photo?: string
  finish?: string
  hex?: string
}

export interface ProductsResponse {
  items: ApiProduct[]
}
