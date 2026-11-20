export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'
export type Transmission = 'Automatic' | 'Manual'
export type BodyStyle = 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Wagon'
/** Brand-new stock versus pre-owned (used) vehicles. */
export type ListingType = 'new' | 'used'
/**
 * How the vehicle is sold. "Lipa mdogo mdogo" = pay in instalments; the deposit
 * and terms are agreed with the showroom (no payment processing on the site).
 */
export type PaymentTerms = 'cash' | 'lipa-mdogo-mdogo'

/**
 * Who stands behind an inspection claim. Only `independently_verified`
 * records with supporting evidence may show a "verified" badge.
 */
export type InspectionSource = 'owner_declared' | 'admin_recorded' | 'independently_verified'

export interface VehicleInspection {
  source: InspectionSource
  title: string
  date: string
  summary: string
  inspector?: string
  hasEvidence: boolean
}

/** Vehicle as exposed to the public website (never includes owner data, VIN or plates). */
export interface PublicVehicle {
  slug: string
  listingType: ListingType
  payment: PaymentTerms
  /** Town the vehicle is sold from (never an owner's address). */
  location: string
  make: string
  model: string
  variant: string
  year: number
  mileageKm: number
  transmission: Transmission
  fuel: FuelType
  bodyStyle: BodyStyle
  engine: string
  colour: string
  priceKes: number
  /** Public image paths, primary first. Missing files fall back to a placeholder. */
  images: string[]
  description: string
  features: string[]
  condition: { summary: string, notes: string[] }
  inspections: VehicleInspection[]
  featured: boolean
  /** When the listing was added to the system (ISO 8601 timestamp). Default sort key. */
  listedAt: string
}

export type VehicleSort = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'mileage-asc' | 'year-desc'

export interface VehicleQuery {
  type?: ListingType
  payment?: PaymentTerms
  location?: string
  q?: string
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxMileage?: number
  fuel?: FuelType
  transmission?: Transmission
  body?: BodyStyle
  sort: VehicleSort
  page?: number
}
