import type { VehicleStatus } from '~/types/admin'

export const VEHICLE_STATUSES: { value: VehicleStatus, label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'archived', label: 'Archived' },
]

export type VehicleAction = 'edit' | 'submit' | 'approve' | 'reject' | 'mark_sold' | 'mark_unavailable' | 'mark_available' | 'archive'

interface ActionRule {
  label: string
  from: VehicleStatus[]
  to: VehicleStatus | null
  permission: string
  danger?: boolean
}

/**
 * The listing lifecycle in one place. Used by table action menus, the details
 * page, the review screens and the mock service, so the rules never diverge.
 * Approval publishes automatically. There is no permanent delete: archive instead.
 */
export const VEHICLE_ACTIONS: Record<VehicleAction, ActionRule> = {
  edit: { label: 'Edit', from: ['draft', 'rejected', 'published', 'unavailable'], to: null, permission: PERMISSIONS.vehicles },
  submit: { label: 'Submit for review', from: ['draft', 'rejected'], to: 'pending_approval', permission: PERMISSIONS.vehicles },
  approve: { label: 'Approve & publish', from: ['pending_approval'], to: 'published', permission: PERMISSIONS.reviews },
  reject: { label: 'Reject', from: ['pending_approval'], to: 'rejected', permission: PERMISSIONS.reviews, danger: true },
  mark_sold: { label: 'Mark sold', from: ['published', 'unavailable'], to: 'sold', permission: PERMISSIONS.vehicles },
  mark_unavailable: { label: 'Mark unavailable', from: ['published'], to: 'unavailable', permission: PERMISSIONS.vehicles },
  mark_available: { label: 'Make available again', from: ['unavailable'], to: 'published', permission: PERMISSIONS.vehicles },
  archive: { label: 'Archive', from: ['draft', 'rejected', 'published', 'unavailable', 'sold'], to: 'archived', permission: PERMISSIONS.vehicles, danger: true },
}

export function canTransition(status: VehicleStatus, action: VehicleAction): boolean {
  return VEHICLE_ACTIONS[action].from.includes(status)
}

/** Actions available for a vehicle in `status` to a user with `can()`. */
export function allowedVehicleActions(status: VehicleStatus, can: (permission: string) => boolean): VehicleAction[] {
  return (Object.keys(VEHICLE_ACTIONS) as VehicleAction[])
    .filter((action) => canTransition(status, action) && can(VEHICLE_ACTIONS[action].permission))
}

export function vehicleStatusLabel(status: VehicleStatus): string {
  return VEHICLE_STATUSES.find((s) => s.value === status)?.label ?? status
}
