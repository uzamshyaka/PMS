/** PROTOTYPE MOCK DATA: vehicle catalogue (makes, models, features). */
import type { VehicleFeature, VehicleMake, VehicleModel } from '~/types/admin'

export const MOCK_MAKES: VehicleMake[] = [
  { id: 1, name: 'Toyota', isActive: true },
  { id: 2, name: 'Mercedes-Benz', isActive: true },
  { id: 3, name: 'BMW', isActive: true },
  { id: 4, name: 'Land Rover', isActive: true },
  { id: 5, name: 'Audi', isActive: true },
  { id: 6, name: 'Mazda', isActive: true },
  { id: 7, name: 'Volkswagen', isActive: true },
  { id: 8, name: 'Lexus', isActive: true },
  { id: 9, name: 'Nissan', isActive: true },
  { id: 10, name: 'Subaru', isActive: true },
  { id: 11, name: 'Honda', isActive: true },
  { id: 12, name: 'Mitsubishi', isActive: true },
  { id: 13, name: 'Isuzu', isActive: true },
  { id: 14, name: 'Ford', isActive: false },
]

const models: [number, number, string][] = [
  [1, 1, 'Land Cruiser Prado'], [2, 1, 'Corolla Cross'], [3, 1, 'Harrier'], [4, 1, 'Hilux'], [5, 1, 'Fielder'], [6, 1, 'Land Cruiser 300'],
  [7, 2, 'C-Class'], [8, 2, 'GLC'], [9, 2, 'E-Class'],
  [10, 3, 'X3'], [11, 3, '5 Series'], [12, 3, 'X5'],
  [13, 4, 'Range Rover Evoque'], [14, 4, 'Range Rover Sport'], [15, 4, 'Discovery'],
  [16, 5, 'A4'], [17, 5, 'Q5'],
  [18, 6, 'CX-5'], [19, 6, 'Demio'],
  [20, 7, 'Golf'], [21, 7, 'Tiguan'],
  [22, 8, 'RX'], [23, 8, 'LX'],
  [24, 9, 'X-Trail'], [25, 9, 'Note'],
  [26, 10, 'Forester'], [27, 10, 'Outback'],
  [28, 11, 'Vezel'], [29, 11, 'CR-V'],
  [30, 12, 'Outlander'],
  [31, 13, 'D-Max'],
  [32, 14, 'Ranger'],
]

export const MOCK_MODELS: VehicleModel[] = models.map(([id, makeId, name]) => ({ id, makeId, name, isActive: makeId !== 14 }))

const features: [string, string][] = [
  ['Leather seats', 'Comfort'], ['Heated seats', 'Comfort'], ['Ventilated seats', 'Comfort'], ['Sunroof', 'Comfort'], ['Panoramic roof', 'Comfort'],
  ['Dual-zone climate control', 'Comfort'], ['Keyless entry', 'Comfort'], ['Power tailgate', 'Comfort'], ['Third-row seating', 'Comfort'],
  ['Apple CarPlay', 'Technology'], ['Android Auto', 'Technology'], ['Navigation', 'Technology'], ['Premium sound system', 'Technology'],
  ['Head-up display', 'Technology'], ['Digital instrument cluster', 'Technology'], ['Wireless charging', 'Technology'],
  ['Reversing camera', 'Safety'], ['360° camera', 'Safety'], ['Parking sensors', 'Safety'], ['Lane keep assist', 'Safety'],
  ['Adaptive cruise control', 'Safety'], ['Blind spot monitoring', 'Safety'], ['Hill descent control', 'Safety'], ['ABS & stability control', 'Safety'],
  ['Alloy wheels', 'Exterior'], ['LED headlights', 'Exterior'], ['Roof rails', 'Exterior'], ['Tow bar', 'Exterior'], ['Tinted windows', 'Exterior'],
  ['All-wheel drive', 'Performance'], ['4WD with low range', 'Performance'], ['Turbocharged engine', 'Performance'], ['Sport mode', 'Performance'],
  ['Differential lock', 'Performance'], ['Hybrid drivetrain', 'Performance'], ['Bull bar', 'Exterior'],
]

export const MOCK_FEATURES: VehicleFeature[] = features.map(([name, category], i) => ({ id: i + 1, name, category, isActive: name !== 'Bull bar' }))

export const FEATURE_CATEGORIES = ['Comfort', 'Technology', 'Safety', 'Exterior', 'Performance'] as const
