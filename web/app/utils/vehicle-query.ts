import type { LocationQuery } from 'vue-router'
import type { PaginationMeta } from '~/types/api'
import type { BodyStyle, FuelType, ListingType, PaymentTerms, PublicVehicle, Transmission, VehicleQuery, VehicleSort } from '~/types/vehicle'

export const LISTING_TYPES: { value: ListingType, label: string, plural: string }[] = [
  { value: 'new', label: 'New', plural: 'New Cars' },
  { value: 'used', label: 'Used', plural: 'Used Cars' },
]
export const PAYMENT_TERMS: { value: PaymentTerms, label: string, description: string }[] = [
  { value: 'cash', label: 'Cash', description: 'Cash sale' },
  { value: 'lipa-mdogo-mdogo', label: 'Lipa Mdogo Mdogo', description: 'Pay in instalments. Deposit and terms agreed with our showroom team.' },
]

export function paymentLabel(payment: PaymentTerms): string {
  return PAYMENT_TERMS.find((t) => t.value === payment)?.label ?? payment
}

export const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
export const TRANSMISSIONS: Transmission[] = ['Automatic', 'Manual']
export const BODY_STYLES: BodyStyle[] = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon']
export const VEHICLE_SORTS: { value: VehicleSort, label: string }[] = [
  { value: 'newest', label: 'Date added: newest first' },
  { value: 'oldest', label: 'Date added: oldest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'mileage-asc', label: 'Lowest mileage' },
  { value: 'year-desc', label: 'Newest model year' },
]

type QueryValue = LocationQuery[string] | undefined

const first = (value: QueryValue): string | undefined => {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
}

const positiveInt = (value: QueryValue): number | undefined => {
  const n = Number(first(value))
  return Number.isInteger(n) && n > 0 ? n : undefined
}

const oneOf = <T extends string>(value: QueryValue, allowed: readonly T[]): T | undefined => {
  const v = first(value)
  return allowed.includes(v as T) ? (v as T) : undefined
}

/** Parse untrusted URL query values into a typed, whitelisted query. */
export function parseVehicleQuery(query: LocationQuery): VehicleQuery {
  return {
    type: oneOf(query.type, LISTING_TYPES.map((t) => t.value)),
    payment: oneOf(query.payment, PAYMENT_TERMS.map((t) => t.value)),
    location: first(query.location),
    q: first(query.q),
    make: first(query.make),
    model: first(query.model),
    minPrice: positiveInt(query.minPrice),
    maxPrice: positiveInt(query.maxPrice),
    minYear: positiveInt(query.minYear),
    maxMileage: positiveInt(query.maxMileage),
    fuel: oneOf(query.fuel, FUEL_TYPES),
    transmission: oneOf(query.transmission, TRANSMISSIONS),
    body: oneOf(query.body, BODY_STYLES),
    sort: oneOf(query.sort, VEHICLE_SORTS.map((s) => s.value)) ?? 'newest',
    page: positiveInt(query.page),
  }
}

/** Serialise back to a URL query, dropping empty values and the default sort. */
export function toRouteQuery(query: VehicleQuery): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || (key === 'sort' && value === 'newest') || (key === 'page' && value === 1)) continue
    out[key] = String(value)
  }
  return out
}

export function filterVehicles(vehicles: readonly PublicVehicle[], q: VehicleQuery): PublicVehicle[] {
  const term = q.q?.toLowerCase()

  return vehicles.filter((v) =>
    (!q.type || v.listingType === q.type)
    && (!q.payment || v.payment === q.payment)
    && (!q.location || v.location === q.location)
    && (!term || `${v.year} ${v.make} ${v.model} ${v.variant}`.toLowerCase().includes(term))
    && (!q.make || v.make === q.make)
    && (!q.model || v.model === q.model)
    && (!q.minPrice || v.priceKes >= q.minPrice)
    && (!q.maxPrice || v.priceKes <= q.maxPrice)
    && (!q.minYear || v.year >= q.minYear)
    && (!q.maxMileage || v.mileageKm <= q.maxMileage)
    && (!q.fuel || v.fuel === q.fuel)
    && (!q.transmission || v.transmission === q.transmission)
    && (!q.body || v.bodyStyle === q.body),
  )
}

/** Sort a copy. Ties fall back to newest-added, then slug, so order is always stable. */
export function sortVehicles(vehicles: PublicVehicle[], sort: VehicleSort): PublicVehicle[] {
  const byNewest = (a: PublicVehicle, b: PublicVehicle) => b.listedAt.localeCompare(a.listedAt) || a.slug.localeCompare(b.slug)
  const compare: Record<VehicleSort, (a: PublicVehicle, b: PublicVehicle) => number> = {
    'newest': byNewest,
    'oldest': (a, b) => -byNewest(a, b),
    'price-asc': (a, b) => a.priceKes - b.priceKes || byNewest(a, b),
    'price-desc': (a, b) => b.priceKes - a.priceKes || byNewest(a, b),
    'mileage-asc': (a, b) => a.mileageKm - b.mileageKm || byNewest(a, b),
    'year-desc': (a, b) => b.year - a.year || byNewest(a, b),
  }
  return [...vehicles].sort(compare[sort])
}

export const VEHICLES_PER_PAGE = 9

/**
 * Slice one page out of a result list. Returns the same meta shape as the
 * API's paginated responses, so pages keep working when the API replaces demo data.
 * Out-of-range pages are clamped to the last page.
 */
export function paginate<T>(items: T[], page = 1, perPage = VEHICLES_PER_PAGE): { items: T[], meta: PaginationMeta } {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, Math.floor(page)), lastPage)
  const start = (current - 1) * perPage
  const slice = items.slice(start, start + perPage)

  return {
    items: slice,
    meta: {
      current_page: current,
      per_page: perPage,
      total,
      last_page: lastPage,
      from: slice.length ? start + 1 : null,
      to: slice.length ? start + slice.length : null,
    },
  }
}

export function vehicleTitle(v: Pick<PublicVehicle, 'make' | 'model' | 'variant'>): string {
  return `${v.make} ${v.model} ${v.variant}`
}

/** Only independently verified records backed by evidence earn a "verified" badge. */
export function isVerifiedInspection(i: { source: string, hasEvidence: boolean }): boolean {
  return i.source === 'independently_verified' && i.hasEvidence
}
