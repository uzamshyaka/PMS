import { describe, expect, it } from 'vitest'
import { DEMO_VEHICLES } from '~/data/demo-vehicles'
import { filterVehicles, isVerifiedInspection, paginate, parseVehicleQuery, sortVehicles, toRouteQuery } from '~/utils/vehicle-query'

describe('parseVehicleQuery', () => {
  it('whitelists values and ignores junk', () => {
    const q = parseVehicleQuery({
      make: 'BMW',
      minPrice: '3000000',
      maxMileage: '-5',
      fuel: 'Steam',
      type: 'second-hand',
      payment: 'credit-card',
      body: 'SUV',
      sort: 'drop table',
      q: '  x3 ',
    })

    expect(q).toMatchObject({ make: 'BMW', minPrice: 3000000, body: 'SUV', sort: 'newest', q: 'x3' })
    expect(q.maxMileage).toBeUndefined()
    expect(q.fuel).toBeUndefined()
    expect(q.type).toBeUndefined()
    expect(q.payment).toBeUndefined()
    expect(parseVehicleQuery({ payment: 'lipa-mdogo-mdogo', location: 'Kisumu' })).toMatchObject({ payment: 'lipa-mdogo-mdogo', location: 'Kisumu' })
    expect(parseVehicleQuery({ type: 'new' }).type).toBe('new')
  })

  it('round-trips through the URL without empty values or the default sort', () => {
    expect(toRouteQuery(parseVehicleQuery({ make: 'Audi', sort: 'newest' }))).toEqual({ make: 'Audi' })
    expect(toRouteQuery(parseVehicleQuery({ sort: 'price-asc' }))).toEqual({ sort: 'price-asc' })
  })
})

describe('filterVehicles / sortVehicles', () => {
  const all = (extra = {}) => ({ sort: 'newest' as const, ...extra })

  it('filters by each criterion', () => {
    expect(filterVehicles(DEMO_VEHICLES, all({ make: 'BMW' })).map((v) => v.model).sort()).toEqual(['5 Series', 'X3'])
    expect(filterVehicles(DEMO_VEHICLES, all({ make: 'BMW', type: 'used' })).map((v) => v.model)).toEqual(['X3'])
    expect(filterVehicles(DEMO_VEHICLES, all({ fuel: 'Hybrid' }))).toHaveLength(2)
    expect(filterVehicles(DEMO_VEHICLES, all({ body: 'SUV' })).every((v) => v.bodyStyle === 'SUV')).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ maxPrice: 4_000_000 })).every((v) => v.priceKes <= 4_000_000)).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ minYear: 2021 })).every((v) => v.year >= 2021)).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ maxMileage: 40_000 })).every((v) => v.mileageKm <= 40_000)).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ q: 'evoque' }))).toHaveLength(1)
    expect(filterVehicles(DEMO_VEHICLES, all({ type: 'new' })).every((v) => v.listingType === 'new')).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ type: 'used' })).every((v) => v.listingType === 'used')).toBe(true)
    expect(filterVehicles(DEMO_VEHICLES, all({ payment: 'lipa-mdogo-mdogo' })).map((v) => v.payment)).toEqual(Array(6).fill('lipa-mdogo-mdogo'))
    expect(filterVehicles(DEMO_VEHICLES, all({ payment: 'cash' }))).toHaveLength(6)
    expect(filterVehicles(DEMO_VEHICLES, all({ location: 'Mombasa' })).map((v) => v.slug).sort()).toEqual(['bmw-x3-2022', 'lexus-rx-450h-2019', 'volkswagen-tiguan-2026'])
    expect(filterVehicles(DEMO_VEHICLES, all({ type: 'new', payment: 'lipa-mdogo-mdogo' }))).toHaveLength(2)
  })

  it('sorts by price both ways', () => {
    const asc = sortVehicles([...DEMO_VEHICLES], 'price-asc').map((v) => v.priceKes)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(sortVehicles([...DEMO_VEHICLES], 'price-desc')[0]!.priceKes).toBe(Math.max(...asc))
  })
})

describe('date-added ordering', () => {
  it('defaults to newest first by the date added to the system', () => {
    const sorted = sortVehicles([...DEMO_VEHICLES], parseVehicleQuery({}).sort)
    const stamps = sorted.map((v) => v.listedAt)
    expect(stamps).toEqual([...stamps].sort().reverse())
    expect(sorted[0]!.slug).toBe('mercedes-benz-glc-2026')
  })

  it('can show oldest first', () => {
    const sorted = sortVehicles([...DEMO_VEHICLES], 'oldest')
    expect(sorted[0]!.slug).toBe('lexus-rx-450h-2019')
    expect(sorted.at(-1)!.slug).toBe('mercedes-benz-glc-2026')
  })

  it('breaks ties by newest-added so the order is stable', () => {
    const a = { ...DEMO_VEHICLES[0]!, slug: 'a', priceKes: 1, listedAt: '2026-01-01T00:00:00Z' }
    const b = { ...DEMO_VEHICLES[0]!, slug: 'b', priceKes: 1, listedAt: '2026-02-01T00:00:00Z' }
    expect(sortVehicles([a, b], 'price-asc').map((v) => v.slug)).toEqual(['b', 'a'])
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 20 }, (_, i) => i + 1)

  it('slices pages and reports API-shaped meta', () => {
    expect(paginate(items, 1, 9)).toEqual({
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      meta: { current_page: 1, per_page: 9, total: 20, last_page: 3, from: 1, to: 9 },
    })
    expect(paginate(items, 3, 9).items).toEqual([19, 20])
    expect(paginate(items, 3, 9).meta).toMatchObject({ from: 19, to: 20 })
  })

  it('clamps out-of-range pages and handles empty lists', () => {
    expect(paginate(items, 99, 9).meta.current_page).toBe(3)
    expect(paginate(items, 0, 9).meta.current_page).toBe(1)
    expect(paginate([], 1, 9).meta).toEqual({ current_page: 1, per_page: 9, total: 0, last_page: 1, from: null, to: null })
  })

  it('keeps page in the URL only when it is not page 1', () => {
    expect(parseVehicleQuery({ page: '2' }).page).toBe(2)
    expect(parseVehicleQuery({ page: 'abc' }).page).toBeUndefined()
    expect(toRouteQuery({ sort: 'newest', page: 1 })).toEqual({})
    expect(toRouteQuery({ sort: 'newest', page: 2 })).toEqual({ page: '2' })
  })
})

describe('isVerifiedInspection', () => {
  it('requires both an independent source and evidence', () => {
    expect(isVerifiedInspection({ source: 'independently_verified', hasEvidence: true })).toBe(true)
    expect(isVerifiedInspection({ source: 'independently_verified', hasEvidence: false })).toBe(false)
    expect(isVerifiedInspection({ source: 'admin_recorded', hasEvidence: true })).toBe(false)
    expect(isVerifiedInspection({ source: 'owner_declared', hasEvidence: true })).toBe(false)
  })
})

describe('demo data', () => {
  it('gives every vehicle a location and payment terms', () => {
    for (const v of DEMO_VEHICLES) {
      expect(v.location).toBeTruthy()
      expect(['cash', 'lipa-mdogo-mdogo']).toContain(v.payment)
    }
  })

  it('has unique slugs and never exposes owner details', () => {
    const slugs = DEMO_VEHICLES.map((v) => v.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const v of DEMO_VEHICLES) {
      expect(Object.keys(v)).not.toContain('owner')
      expect(Object.keys(v)).not.toContain('vin')
    }
  })
})
