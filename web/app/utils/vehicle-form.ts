import type { AdminVehicle, VehicleInput } from '~/types/admin'

export const VEHICLE_FORM_STEPS = [
  { key: 'basics', label: 'Basic information' },
  { key: 'specs', label: 'Specifications' },
  { key: 'features', label: 'Features' },
  { key: 'photos', label: 'Photographs' },
  { key: 'condition', label: 'Condition & inspection' },
  { key: 'review', label: 'Review' },
] as const

/** Fields validated on each step (index matches VEHICLE_FORM_STEPS). */
export const VEHICLE_STEP_FIELDS: (keyof VehicleInput)[][] = [
  ['ownerId', 'makeId', 'modelId', 'year', 'title', 'description'],
  ['listingType', 'mileageKm', 'priceKes', 'fuel', 'transmission', 'bodyStyle', 'engineCc', 'exteriorColour', 'drivetrain', 'doors', 'seats', 'conditionGrade', 'payment', 'location'],
  [],
  [],
  [],
  [],
]

export const COLOURS = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Other']
export const LOCATIONS = ['Eldoret', 'Kisumu', 'Machakos', 'Mombasa', 'Nairobi', 'Nakuru', 'Thika']

export function emptyVehicleInput(): VehicleInput {
  return {
    ownerId: null,
    makeId: null,
    modelId: null,
    year: null,
    title: '',
    description: '',
    listingType: 'used',
    mileageKm: null,
    priceKes: null,
    currency: 'KES',
    fuel: '',
    transmission: '',
    bodyStyle: '',
    engineCc: null,
    exteriorColour: '',
    interiorColour: '',
    drivetrain: '',
    doors: 4,
    seats: 5,
    conditionGrade: '',
    payment: '',
    location: '',
    featureIds: [],
    images: [],
    conditionNotes: '',
    inspections: [],
  }
}

/** Map a stored vehicle to editable form input. */
export function toVehicleInput(v: AdminVehicle): VehicleInput {
  return {
    ...emptyVehicleInput(),
    ...structuredClone({
      ownerId: v.ownerId, makeId: v.makeId, modelId: v.modelId, year: v.year, title: v.title, description: v.description,
      listingType: v.listingType, mileageKm: v.mileageKm, priceKes: v.priceKes, currency: v.currency, fuel: v.fuel,
      transmission: v.transmission, bodyStyle: v.bodyStyle, engineCc: v.engineCc, exteriorColour: v.exteriorColour,
      interiorColour: v.interiorColour, drivetrain: v.drivetrain, doors: v.doors, seats: v.seats,
      conditionGrade: v.conditionGrade, payment: v.payment, location: v.location, featureIds: v.featureIds,
      images: v.images, conditionNotes: v.conditionNotes, inspections: v.inspections,
    }),
  }
}

export const IMAGE_RULES = { types: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 8 * 1024 * 1024, maxCount: 20 }

/** Validate selected files; returns accepted files and a message per rejected file. */
export function validateImageFiles(files: File[], existingCount: number): { accepted: File[], errors: string[] } {
  const accepted: File[] = []
  const errors: string[] = []
  for (const file of files) {
    if (!IMAGE_RULES.types.includes(file.type)) errors.push(`${file.name}: only JPEG, PNG or WebP images are allowed.`)
    else if (file.size > IMAGE_RULES.maxBytes) errors.push(`${file.name}: larger than 8 MB.`)
    else if (existingCount + accepted.length >= IMAGE_RULES.maxCount) errors.push(`${file.name}: a vehicle can have at most ${IMAGE_RULES.maxCount} photos.`)
    else accepted.push(file)
  }
  return { accepted, errors }
}

/** Move an item within a list (used for photo reordering). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}
