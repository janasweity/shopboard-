export type Category =
  'living-room' | 'kitchen-dining' | 'bedroom' | 'bathroom' | 'home-decor'

export type CollectionId = 'nature-form' | 'burgundy-butter' | 'kitchen-dining'

export interface ProductVariant {
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

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  image: string
  alt: string
  description: string
  dimensions: string
  materials: string
  collection: CollectionId
  // Every catalogue product has at least its original photographed finish.
  variants: [ProductVariant, ...ProductVariant[]]
  categories?: Category[]
  tag?: string
  room?: string
  care?: string
  photography?: string
  photoSubject?: string
  photo?: string
  finish?: string
  hex?: string
}

export interface Collection {
  id: CollectionId
  name: string
  image: string
  alt: string
  description: string
  tone: string
}

export interface Room {
  id: string
  name: string
  title: string
  image: string
  alt: string
  description: string
  categories: Category[]
  collection: CollectionId
}

export interface RoomProduct {
  id: string
  color: string
}

export interface InspirationRoom {
  id: string
  name: string
  title: string
  description: string
  image: string
  alt: string
  items: RoomProduct[]
}

export interface GalleryImage {
  id: string
  label: string
  image: string
  alt: string
}

export interface ProductGallery {
  finish: string
  views: GalleryImage[]
}

export type PriceSort = 'default' | 'price-asc' | 'price-desc'

export interface ProductSelection {
  query?: string
  category?: string
  sort?: PriceSort
}
