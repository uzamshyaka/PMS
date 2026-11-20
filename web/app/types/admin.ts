import type { PaginationMeta } from '~/types/api'
import type { BodyStyle, FuelType, ListingType, PaymentTerms, Transmission, VehicleInspection } from '~/types/vehicle'


// ---------------------------------------------------------------- shared

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

/** Query for any admin list. Mirrors the planned API query parameters. */
export interface ListQuery {
  search?: string
  status?: string
  sort?: string
  page: number
  perPage?: number
  filters: Record<string, string | undefined>
}

export type RecordStatus = 'active' | 'inactive'

// ---------------------------------------------------------------- catalogue

export interface VehicleMake {
  id: number
  name: string
  isActive: boolean
}

export interface VehicleModel {
  id: number
  makeId: number
  name: string
  isActive: boolean
}

export interface VehicleFeature {
  id: number
  name: string
  category: string
  isActive: boolean
}

// ---------------------------------------------------------------- vehicles

export type VehicleStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'sold' | 'unavailable' | 'archived'
export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4WD'
export type ConditionGrade = 'New' | 'Excellent' | 'Very good' | 'Good' | 'Fair'

export interface VehicleImage {
  id: string
  url: string
  name: string
  isPrimary: boolean
}

export interface VehicleReview {
  id: number
  vehicleId: number
  action: 'submitted' | 'approved' | 'rejected'
  reason?: string
  actorName: string
  createdAt: string
}

/** Everything the vehicle form edits. */
export interface VehicleInput {
  ownerId: number | null
  makeId: number | null
  modelId: number | null
  year: number | null
  title: string
  description: string
  listingType: ListingType
  mileageKm: number | null
  priceKes: number | null
  currency: 'KES'
  fuel: FuelType | ''
  transmission: Transmission | ''
  bodyStyle: BodyStyle | ''
  engineCc: number | null
  exteriorColour: string
  interiorColour: string
  drivetrain: Drivetrain | ''
  doors: number | null
  seats: number | null
  conditionGrade: ConditionGrade | ''
  payment: PaymentTerms | ''
  location: string
  featureIds: number[]
  images: VehicleImage[]
  conditionNotes: string
  inspections: VehicleInspection[]
}

/**
 * A stored vehicle. Drafts may be incomplete, so choice fields can still be ''
 * (shown as "—"); submitted listings always have them filled in.
 */
export interface AdminVehicle extends Omit<VehicleInput, 'ownerId' | 'makeId' | 'modelId' | 'year' | 'mileageKm' | 'priceKes' | 'engineCc' | 'doors' | 'seats'> {
  id: number
  reference: string
  ownerId: number
  makeId: number
  modelId: number
  year: number
  /** May be null on incomplete drafts. */
  mileageKm: number | null
  priceKes: number | null
  engineCc: number | null
  doors: number | null
  seats: number | null
  status: VehicleStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

/** List row: vehicle plus resolved names, as the API's admin resource would return. */
export interface AdminVehicleRow extends AdminVehicle {
  makeName: string
  modelName: string
  ownerName: string
}

export interface VehicleStats {
  byStatus: Record<VehicleStatus, number>
  total: number
  newEnquiries: number
}

// ---------------------------------------------------------------- owners

export type OwnerType = 'individual' | 'business'

export interface OwnerInput {
  type: OwnerType
  name: string
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  location: string
  status: RecordStatus
  notes: string
}

export interface Owner extends OwnerInput {
  id: number
  createdAt: string
}

export interface OwnerRow extends Owner {
  vehicleCount: number
}

// ---------------------------------------------------------------- enquiries

export type EnquiryStatus = 'new' | 'contacted' | 'follow_up' | 'closed'

export interface EnquiryHistoryEntry {
  status: EnquiryStatus
  at: string
  by: string
  note?: string
}

export interface EnquiryNote {
  id: number
  body: string
  author: string
  at: string
}

export interface Enquiry {
  id: number
  customerName: string
  phone: string
  email: string
  vehicleId: number | null
  message: string
  status: EnquiryStatus
  assignedToId: number | null
  createdAt: string
  history: EnquiryHistoryEntry[]
  notes: EnquiryNote[]
}

export interface EnquiryRow extends Enquiry {
  vehicleTitle: string | null
  assignedToName: string | null
}

// ---------------------------------------------------------------- users

export interface AdminUserInput {
  name: string
  email: string
  roles: string[]
  isActive: boolean
  /** Required when creating; optional when editing (leave blank to keep the current one). */
  password?: string
}

export interface AdminUserRecord extends AdminUserInput {
  id: number
  lastLoginAt: string | null
  createdAt: string
}

export interface RoleSummary {
  name: string
  label: string
  description: string
  permissions: string[]
  userCount: number
}

// ---------------------------------------------------------------- content & settings

export type ContentSection = 'homepage' | 'about' | 'contact' | 'branding' | 'seo' | 'settings'
export type ContentValues = Record<string, string | number | boolean | number[]>

// ---------------------------------------------------------------- audit

export interface AuditLog {
  id: number
  at: string
  userName: string
  action: string
  module: string
  entity: string
  details: string
}

export interface Notification {
  id: string
  title: string
  description: string
  to: string
  at: string
}
