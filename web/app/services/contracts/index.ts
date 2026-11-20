/**
 * Admin data contracts. Pages and composables depend only on these
 * interfaces. Two implementations: services/api (Laravel, /api/v1/admin/*)
 * and services/mock (in-memory prototype, used by tests and demos).
 */
import type {
  AdminUserInput, AdminUserRecord, AdminVehicle, AdminVehicleRow, AuditLog, ContentSection, ContentValues,
  Enquiry, EnquiryRow, EnquiryStatus, ListQuery, Notification, Owner, OwnerInput, OwnerRow, Paginated,
  RecordStatus, RoleSummary, VehicleFeature, VehicleImage, VehicleInput, VehicleMake, VehicleModel, VehicleReview, VehicleStats,
} from '~/types/admin'
import type { VehicleAction } from '~/utils/vehicle-status'

export interface VehicleService {
  list(query: ListQuery): Promise<Paginated<AdminVehicleRow>>
  get(id: number): Promise<AdminVehicleRow>
  create(input: VehicleInput, intent: 'draft' | 'submit'): Promise<AdminVehicle>
  update(id: number, input: VehicleInput, intent: 'save' | 'submit'): Promise<AdminVehicle>
  /** Lifecycle transitions (submit, approve, reject, sold, unavailable, archive…). Reject requires a reason. */
  transition(id: number, action: VehicleAction, reason?: string): Promise<AdminVehicle>
  statusCounts(query?: ListQuery): Promise<Record<string, number>>
  stats(): Promise<VehicleStats>
  recent(limit: number): Promise<AdminVehicleRow[]>
  reviews(vehicleId: number): Promise<VehicleReview[]>
  activity(vehicleId: number): Promise<AuditLog[]>
  /** Upload photos (API: re-encoded and stored in the S3 bucket). Returns images to attach on save. */
  uploadImages(files: File[]): Promise<VehicleImage[]>
}

export interface OwnerService {
  list(query: ListQuery): Promise<Paginated<OwnerRow>>
  all(): Promise<Owner[]>
  get(id: number): Promise<OwnerRow>
  create(input: OwnerInput): Promise<Owner>
  update(id: number, input: OwnerInput): Promise<Owner>
  setStatus(id: number, status: RecordStatus): Promise<Owner>
  vehicles(id: number): Promise<AdminVehicleRow[]>
  activity(id: number): Promise<AuditLog[]>
}

export interface EnquiryService {
  list(query: ListQuery): Promise<Paginated<EnquiryRow>>
  get(id: number): Promise<EnquiryRow>
  updateStatus(id: number, status: EnquiryStatus, note?: string): Promise<Enquiry>
  assign(id: number, userId: number | null): Promise<Enquiry>
  addNote(id: number, body: string): Promise<Enquiry>
  statusCounts(): Promise<Record<string, number>>
  recent(limit: number): Promise<EnquiryRow[]>
  /** Staff who can be assigned enquiries. */
  assignees(): Promise<{ id: number, name: string }[]>
}

export type CatalogueKind = 'makes' | 'models' | 'features'
export type CatalogueItem = VehicleMake | VehicleModel | VehicleFeature

export interface CatalogueService {
  makes(): Promise<VehicleMake[]>
  models(): Promise<VehicleModel[]>
  features(): Promise<VehicleFeature[]>
  save<K extends CatalogueKind>(kind: K, item: Partial<CatalogueItem> & { id?: number }): Promise<CatalogueItem>
  setActive(kind: CatalogueKind, id: number, isActive: boolean): Promise<void>
}

export interface UserService {
  list(query: ListQuery): Promise<Paginated<AdminUserRecord>>
  all(): Promise<AdminUserRecord[]>
  get(id: number): Promise<AdminUserRecord>
  create(input: AdminUserInput): Promise<AdminUserRecord>
  update(id: number, input: AdminUserInput): Promise<AdminUserRecord>
  roles(): Promise<RoleSummary[]>
  activity(id: number): Promise<AuditLog[]>
}

export interface ContentService {
  get(section: ContentSection): Promise<ContentValues>
  save(section: ContentSection, values: ContentValues): Promise<ContentValues>
  /** Upload a logo / sharing image; returns its public URL. */
  uploadImage(file: File): Promise<string>
}

export interface AuditService {
  list(query: ListQuery): Promise<Paginated<AuditLog>>
  facets(): Promise<{ users: string[], actions: string[], modules: string[] }>
}

export interface NotificationService {
  list(can: (permission: string) => boolean): Promise<Notification[]>
}

export interface AdminServices {
  vehicles: VehicleService
  owners: OwnerService
  enquiries: EnquiryService
  catalogue: CatalogueService
  users: UserService
  content: ContentService
  audit: AuditService
  notifications: NotificationService
}
