import type { AdminVehicle } from '~/types/admin'
import type { AdminAction } from '~/types/admin-ui'
import type { IconName } from '~/utils/icons'
import type { VehicleAction } from '~/utils/vehicle-status'

const ICONS: Record<VehicleAction, IconName> = {
  edit: 'pencil',
  submit: 'send',
  approve: 'check',
  reject: 'x-circle',
  mark_sold: 'tag',
  mark_unavailable: 'clock',
  mark_available: 'history',
  archive: 'archive',
}

const CONFIRM: Partial<Record<VehicleAction, { title: string, message: string }>> = {
  submit: { title: 'Submit for review?', message: 'A reviewer will check this listing before it is published.' },
  approve: { title: 'Approve and publish?', message: 'Approving publishes the listing on the public website immediately.' },
  reject: { title: 'Reject this listing?', message: 'The listing returns to the vehicle team with your reason so they can correct it and resubmit.' },
  mark_sold: { title: 'Mark as sold?', message: 'The vehicle is removed from the public website and recorded as sold.' },
  mark_unavailable: { title: 'Mark as unavailable?', message: 'The listing is hidden from the website until you make it available again.' },
  mark_available: { title: 'Make available again?', message: 'The listing will show on the public website again.' },
  archive: { title: 'Archive this vehicle?', message: 'Archived vehicles are kept for records but hidden everywhere. Nothing is deleted.' },
}

/**
 * Vehicle lifecycle actions for the current user, shared by tables, the
 * details page and the review screens. `onDone` runs after a successful change.
 */
export function useVehicleActions(onDone: () => unknown) {
  const auth = useAuthStore()
  const services = useAdminServices()
  const { confirm, run } = useAdminFeedback()

  async function perform(vehicle: Pick<AdminVehicle, 'id' | 'title'>, action: VehicleAction) {
    const prompt = CONFIRM[action]!
    const result = await confirm({
      ...prompt,
      message: `${vehicle.title}: ${prompt.message}`,
      confirmLabel: VEHICLE_ACTIONS[action].label,
      tone: VEHICLE_ACTIONS[action].danger ? 'danger' : 'default',
      reason: action === 'reject'
        ? { label: 'Reason and required corrections', minLength: 20, placeholder: 'e.g. Upload clear photos of the odometer and the rear of the vehicle.' }
        : undefined,
    })
    if (!result.confirmed) return false
    const done = await run(() => services.vehicles.transition(vehicle.id, action, result.reason), `${VEHICLE_ACTIONS[action].label}: done`)
    if (done) await onDone()
    return !!done
  }

  /** Menu entries for a vehicle in its current status. */
  function menuFor(vehicle: Pick<AdminVehicle, 'id' | 'title' | 'status'>, options: { includeView?: boolean } = {}): AdminAction[] {
    const actions: AdminAction[] = options.includeView ? [{ label: 'View', icon: 'eye', to: `/admin/vehicles/${vehicle.id}` }] : []
    for (const action of allowedVehicleActions(vehicle.status, auth.can)) {
      if (action === 'edit') actions.push({ label: 'Edit', icon: ICONS.edit, to: `/admin/vehicles/${vehicle.id}/edit` })
      else actions.push({ label: VEHICLE_ACTIONS[action].label, icon: ICONS[action], danger: VEHICLE_ACTIONS[action].danger, onSelect: () => perform(vehicle, action) })
    }
    return actions
  }

  return { perform, menuFor }
}
