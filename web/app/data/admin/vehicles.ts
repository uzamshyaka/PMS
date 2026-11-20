/** PROTOTYPE MOCK DATA: admin vehicle records across every listing status. */
import type { AdminVehicle, ConditionGrade, Drivetrain, VehicleReview, VehicleStatus } from '~/types/admin'
import type { BodyStyle, FuelType, ListingType, PaymentTerms, Transmission } from '~/types/vehicle'
import { MOCK_MAKES, MOCK_MODELS } from './catalogue'

type Row = [
  id: number, modelId: number, variant: string, year: number, km: number, price: number,
  fuel: FuelType, trans: Transmission, body: BodyStyle, cc: number, colour: string,
  ownerId: number, status: VehicleStatus, type: ListingType, payment: PaymentTerms, location: string, created: string,
]

const ROWS: Row[] = [
  [1, 8, '300 4MATIC AMG Line', 2026, 0, 11950000, 'Petrol', 'Automatic', 'SUV', 1999, 'Obsidian Black', 7, 'published', 'new', 'cash', 'Nairobi', '2026-11-16T10:05:00Z'],
  [2, 11, '520i M Sport', 2026, 0, 10450000, 'Petrol', 'Automatic', 'Sedan', 1998, 'Carbon Black', 7, 'published', 'new', 'lipa-mdogo-mdogo', 'Nairobi', '2026-11-15T13:25:00Z'],
  [3, 2, '1.8 Hybrid XR', 2026, 0, 4850000, 'Hybrid', 'Automatic', 'SUV', 1798, 'Platinum White', 10, 'published', 'new', 'lipa-mdogo-mdogo', 'Kisumu', '2026-11-13T09:50:00Z'],
  [4, 21, '2.0 TSI R-Line', 2026, 0, 7250000, 'Petrol', 'Automatic', 'SUV', 1984, 'Oryx White', 2, 'published', 'new', 'cash', 'Mombasa', '2026-11-12T08:30:00Z'],
  [5, 10, 'xDrive20d M Sport', 2022, 29000, 6790000, 'Diesel', 'Automatic', 'SUV', 1995, 'Carbon Black', 2, 'published', 'used', 'cash', 'Mombasa', '2026-11-12T14:05:00Z'],
  [6, 7, 'C200 AMG Line', 2021, 45000, 5490000, 'Petrol', 'Automatic', 'Sedan', 1496, 'Obsidian Black', 1, 'published', 'used', 'cash', 'Nairobi', '2026-11-10T09:15:00Z'],
  [7, 13, 'D180 SE', 2020, 38000, 6290000, 'Diesel', 'Automatic', 'SUV', 1999, 'Fuji White', 3, 'published', 'used', 'lipa-mdogo-mdogo', 'Nairobi', '2026-11-08T11:40:00Z'],
  [8, 16, '35 TFSI Advanced', 2021, 31000, 4990000, 'Petrol', 'Automatic', 'Sedan', 1984, 'Glacier White', 4, 'published', 'used', 'lipa-mdogo-mdogo', 'Nakuru', '2026-11-05T10:20:00Z'],
  [9, 1, 'TX-L', 2019, 72000, 7350000, 'Diesel', 'Automatic', 'SUV', 2755, 'Attitude Black', 6, 'published', 'used', 'cash', 'Eldoret', '2026-10-30T16:45:00Z'],
  [10, 18, '2.2D Takumi', 2021, 41000, 3650000, 'Diesel', 'Automatic', 'SUV', 2191, 'Soul Red', 10, 'published', 'used', 'lipa-mdogo-mdogo', 'Kisumu', '2026-10-22T08:55:00Z'],
  [11, 20, 'GTI', 2020, 36000, 3290000, 'Petrol', 'Automatic', 'Hatchback', 1984, 'Tornado Red', 11, 'published', 'used', 'lipa-mdogo-mdogo', 'Nairobi', '2026-10-18T12:30:00Z'],
  [12, 22, '450h F Sport', 2019, 58000, 5850000, 'Hybrid', 'Automatic', 'SUV', 3456, 'Sonic Titanium', 8, 'published', 'used', 'cash', 'Mombasa', '2026-10-10T15:10:00Z'],
  [13, 3, '2.0 Premium', 2020, 64000, 4150000, 'Petrol', 'Automatic', 'SUV', 1986, 'Pearl White', 12, 'pending_approval', 'used', 'lipa-mdogo-mdogo', 'Nairobi', '2026-11-18T09:40:00Z'],
  [14, 14, 'HSE Dynamic', 2021, 42000, 14800000, 'Diesel', 'Automatic', 'SUV', 2997, 'Santorini Black', 7, 'pending_approval', 'used', 'cash', 'Nairobi', '2026-11-17T14:00:00Z'],
  [15, 24, '2.0 Xtronic', 2019, 81000, 2650000, 'Petrol', 'Automatic', 'SUV', 1997, 'Brilliant Silver', 5, 'pending_approval', 'used', 'lipa-mdogo-mdogo', 'Kisumu', '2026-11-17T09:12:00Z'],
  [16, 4, '2.8 GD-6 Double Cab', 2022, 52000, 5600000, 'Diesel', 'Manual', 'Wagon', 2755, 'Glacier White', 4, 'pending_approval', 'used', 'cash', 'Nakuru', '2026-11-16T07:35:00Z'],
  [17, 26, '2.0i-S Eyesight', 2020, 47000, 3450000, 'Petrol', 'Automatic', 'SUV', 1995, 'Horizon Blue', 11, 'pending_approval', 'used', 'lipa-mdogo-mdogo', 'Thika', '2026-11-15T17:20:00Z'],
  [18, 28, 'Hybrid Z', 2019, 69000, 2450000, 'Hybrid', 'Automatic', 'SUV', 1496, 'Premium Crystal Red', 8, 'draft', 'used', 'lipa-mdogo-mdogo', 'Mombasa', '2026-11-18T12:00:00Z'],
  [19, 9, 'E300 AMG Line', 2020, 55000, 6950000, 'Petrol', 'Automatic', 'Sedan', 1991, 'Selenite Grey', 1, 'draft', 'used', 'cash', 'Nairobi', '2026-11-17T10:30:00Z'],
  [20, 31, '3.0 LS-U', 2023, 23000, 5100000, 'Diesel', 'Manual', 'Wagon', 2999, 'Obsidian Grey', 2, 'draft', 'used', 'lipa-mdogo-mdogo', 'Mombasa', '2026-11-14T08:45:00Z'],
  [21, 5, '1.5 X', 2018, 98000, 1450000, 'Petrol', 'Automatic', 'Wagon', 1496, 'Silver Metallic', 9, 'rejected', 'used', 'lipa-mdogo-mdogo', 'Machakos', '2026-11-09T11:00:00Z'],
  [22, 12, 'xDrive40i M Sport', 2020, 61000, 9800000, 'Petrol', 'Automatic', 'SUV', 2998, 'Mineral White', 12, 'rejected', 'used', 'cash', 'Nairobi', '2026-11-06T13:30:00Z'],
  [23, 6, 'GR Sport', 2023, 18000, 21500000, 'Diesel', 'Automatic', 'SUV', 3346, 'Precious White Pearl', 7, 'sold', 'used', 'cash', 'Nairobi', '2026-09-20T10:00:00Z'],
  [24, 19, '1.3 13S', 2019, 74000, 1350000, 'Petrol', 'Automatic', 'Hatchback', 1298, 'Machine Grey', 5, 'sold', 'used', 'lipa-mdogo-mdogo', 'Kisumu', '2026-09-02T09:20:00Z'],
  [25, 17, '45 TFSI quattro', 2021, 39000, 7450000, 'Petrol', 'Automatic', 'SUV', 1984, 'Navarra Blue', 4, 'sold', 'used', 'cash', 'Nakuru', '2026-08-15T14:10:00Z'],
  [26, 29, '1.5 Turbo EX', 2020, 57000, 3850000, 'Petrol', 'Automatic', 'SUV', 1498, 'Lunar Silver', 3, 'unavailable', 'used', 'lipa-mdogo-mdogo', 'Nairobi', '2026-10-25T10:40:00Z'],
  [27, 30, '2.4 PHEV GX', 2019, 83000, 2950000, 'Hybrid', 'Automatic', 'SUV', 2360, 'White Diamond', 6, 'unavailable', 'used', 'cash', 'Eldoret', '2026-10-12T12:50:00Z'],
  [28, 27, '2.5i Premium', 2018, 104000, 2350000, 'Petrol', 'Automatic', 'Wagon', 2498, 'Crystal Black', 9, 'archived', 'used', 'cash', 'Machakos', '2026-07-01T08:00:00Z'],
  [29, 25, '1.2 e-Power', 2018, 91000, 1150000, 'Hybrid', 'Automatic', 'Hatchback', 1198, 'Pearl White', 8, 'archived', 'used', 'lipa-mdogo-mdogo', 'Mombasa', '2026-06-18T09:30:00Z'],
  [30, 15, 'D300 R-Dynamic SE', 2022, 33000, 12900000, 'Diesel', 'Automatic', 'SUV', 2997, 'Eiger Grey', 7, 'published', 'used', 'cash', 'Nairobi', '2026-11-03T11:15:00Z'],
]

const DRIVE: Record<BodyStyle, Drivetrain> = { SUV: 'AWD', Sedan: 'RWD', Hatchback: 'FWD', Coupe: 'RWD', Wagon: '4WD' }
const grade = (km: number): ConditionGrade => (km === 0 ? 'New' : km < 35000 ? 'Excellent' : km < 70000 ? 'Very good' : 'Good')
const featureSet = (id: number) => [1, 7, 10, 11, 17, 19, 25, 26].concat(id % 2 ? [4, 21, 30] : [2, 13, 18]).concat(id % 3 ? [] : [5, 14])
const created = (iso: string, mins: number) => new Date(new Date(iso).getTime() + mins * 60_000).toISOString()

export const MOCK_VEHICLES: AdminVehicle[] = ROWS.map(([id, modelId, variant, year, km, price, fuel, transmission, bodyStyle, cc, colour, ownerId, status, listingType, payment, location, createdAt]) => {
  const model = MOCK_MODELS.find((m) => m.id === modelId)!
  const make = MOCK_MAKES.find((m) => m.id === model.makeId)!
  const slug = `${make.name}-${model.name}-${year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const submitted = status !== 'draft'
  return {
    id,
    reference: `CS-${String(1000 + id)}`,
    ownerId,
    makeId: make.id,
    modelId,
    year,
    title: `${year} ${make.name} ${model.name} ${variant}`,
    description: `${listingType === 'new' ? 'Brand-new' : 'Well-kept'} ${make.name} ${model.name} ${variant} in ${colour}. ${km ? `${km.toLocaleString('en-US')} km on the clock.` : 'Delivery mileage only.'} Available for viewing in ${location}.`,
    listingType,
    mileageKm: km,
    priceKes: price,
    currency: 'KES',
    fuel,
    transmission,
    bodyStyle,
    engineCc: cc,
    exteriorColour: colour,
    interiorColour: id % 2 ? 'Black leather' : 'Beige leather',
    drivetrain: DRIVE[bodyStyle],
    doors: bodyStyle === 'Hatchback' ? 5 : 4,
    seats: modelId === 1 || modelId === 6 ? 7 : 5,
    conditionGrade: grade(km),
    payment,
    location,
    featureIds: featureSet(id),
    images: [1, 2, 3].map((n) => ({ id: `${id}-${n}`, url: `/images/vehicles/${slug}-${n}.webp`, name: `${slug}-${n}.webp`, isPrimary: n === 1 })),
    conditionNotes: km === 0 ? 'New vehicle, delivery mileage only.' : 'Normal wear for age. Service records available on request.',
    inspections: km === 0
      ? [{ source: 'admin_recorded', title: 'Pre-delivery inspection', date: createdAt.slice(0, 10), summary: 'Pre-delivery checks completed.', hasEvidence: false }]
      : [
          { source: 'owner_declared', title: 'Service history', date: createdAt.slice(0, 10), summary: 'Owner reports regular servicing.', hasEvidence: false },
          ...(id % 3 === 0 ? [{ source: 'independently_verified' as const, title: 'Pre-sale inspection', date: createdAt.slice(0, 10), summary: 'Independent mechanical and body inspection, no major findings.', inspector: 'AA Kenya inspection centre', hasEvidence: true }] : []),
        ],
    status,
    createdBy: id % 2 ? 'Wanjiru Kamau' : 'Development Admin',
    createdAt,
    updatedAt: created(createdAt, 90),
    submittedAt: submitted ? created(createdAt, 45) : undefined,
  }
})

const REJECT_REASONS: Record<number, string> = {
  21: 'Photos are blurry and the odometer reading is not visible. Please upload clear exterior and dashboard photos.',
  22: 'Asking price is far above recent sales for this model and year. Please confirm the price with the owner.',
}

/** Review history generated from each vehicle's current status. */
export const MOCK_REVIEWS: VehicleReview[] = MOCK_VEHICLES.flatMap((v) => {
  if (!v.submittedAt) return []
  const entries: VehicleReview[] = [{ id: v.id * 10, vehicleId: v.id, action: 'submitted', actorName: v.createdBy, createdAt: v.submittedAt }]
  const decidedAt = created(v.submittedAt, 180)
  if (v.status === 'rejected') {
    entries.push({ id: v.id * 10 + 1, vehicleId: v.id, action: 'rejected', reason: REJECT_REASONS[v.id] ?? 'Missing information.', actorName: 'Brian Otieno', createdAt: decidedAt })
  }
  else if (v.status !== 'pending_approval') {
    entries.push({ id: v.id * 10 + 1, vehicleId: v.id, action: 'approved', actorName: v.id % 2 ? 'Brian Otieno' : 'Grace Achieng', createdAt: decidedAt })
  }
  return entries
})
