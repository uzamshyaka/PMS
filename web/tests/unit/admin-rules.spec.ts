import { describe, expect, it } from 'vitest'
import { visibleAdminNav } from '~/utils/admin-nav'
import { PERMISSIONS, ROLE_DEFINITIONS } from '~/utils/permissions'
import { allowedVehicleActions, canTransition, VEHICLE_ACTIONS } from '~/utils/vehicle-status'
import { emptyVehicleInput, moveItem, toVehicleInput, validateImageFiles } from '~/utils/vehicle-form'
import { MOCK_VEHICLES } from '~/data/admin/vehicles'

const canFor = (role: string) => {
  const perms = ROLE_DEFINITIONS.find((r) => r.name === role)!.permissions as string[]
  return (p: string) => perms.includes(p)
}
const labels = (role: string) => visibleAdminNav(canFor(role)).flatMap((g) => g.items.map((i) => i.label))

describe('role-based navigation (UX only; the API enforces access)', () => {
  it('matches the agreed visibility table', () => {
    expect(labels('super-admin')).toEqual(['Dashboard', 'Vehicles', 'Owners', 'Listing Reviews', 'Enquiries', 'Vehicle Catalogue', 'Website Management', 'Users & Roles', 'Settings', 'Audit Logs'])
    expect(labels('vehicle-manager')).toEqual(['Dashboard', 'Vehicles', 'Owners', 'Vehicle Catalogue'])
    expect(labels('reviewer')).toEqual(['Dashboard', 'Listing Reviews'])
    expect(labels('enquiry-manager')).toEqual(['Dashboard', 'Enquiries'])
  })

  it('drops empty groups and shows nothing without permissions', () => {
    expect(visibleAdminNav(() => false)).toEqual([])
    expect(visibleAdminNav(canFor('reviewer')).map((g) => g.heading)).toEqual(['Main menu'])
  })

  it('only uses permissions that exist on the backend', () => {
    const known = Object.values(PERMISSIONS) as string[]
    const used = visibleAdminNav(() => true).flatMap((g) => g.items.flatMap((i) => [i.permission, ...(i.children ?? []).map((c) => c.permission ?? i.permission)]))
    expect(used.every((p) => known.includes(p))).toBe(true)
  })
})

describe('vehicle lifecycle rules', () => {
  const all = () => true

  it('allows the right actions per status', () => {
    expect(allowedVehicleActions('draft', all)).toEqual(['edit', 'submit', 'archive'])
    expect(allowedVehicleActions('pending_approval', all)).toEqual(['approve', 'reject'])
    expect(allowedVehicleActions('published', all)).toEqual(['edit', 'mark_sold', 'mark_unavailable', 'archive'])
    expect(allowedVehicleActions('rejected', all)).toEqual(['edit', 'submit', 'archive'])
    expect(allowedVehicleActions('sold', all)).toEqual(['archive'])
    expect(allowedVehicleActions('archived', all)).toEqual([])
  })

  it('splits actions by permission: managers cannot approve, reviewers cannot edit', () => {
    expect(allowedVehicleActions('pending_approval', canFor('vehicle-manager'))).toEqual([])
    expect(allowedVehicleActions('pending_approval', canFor('reviewer'))).toEqual(['approve', 'reject'])
    expect(allowedVehicleActions('draft', canFor('reviewer'))).toEqual([])
  })

  it('approval publishes; there is no delete action', () => {
    expect(VEHICLE_ACTIONS.approve.to).toBe('published')
    expect(Object.keys(VEHICLE_ACTIONS)).not.toContain('delete')
    expect(canTransition('archived', 'archive')).toBe(false)
  })
})

describe('vehicle form helpers', () => {
  const file = (name: string, type: string, size = 1000) => new File([new Uint8Array(size)], name, { type })

  it('validates photo type, size and count', () => {
    const { accepted, errors } = validateImageFiles([
      file('a.jpg', 'image/jpeg'),
      file('b.gif', 'image/gif'),
      file('c.png', 'image/png', 9 * 1024 * 1024),
    ], 0)
    expect(accepted.map((f) => f.name)).toEqual(['a.jpg'])
    expect(errors).toEqual(['b.gif: only JPEG, PNG or WebP images are allowed.', 'c.png: larger than 8 MB.'])
    expect(validateImageFiles([file('d.webp', 'image/webp')], 20).errors[0]).toContain('at most 20')
  })

  it('reorders photos', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
  })

  it('maps a stored vehicle to form input and back', () => {
    const input = toVehicleInput(MOCK_VEHICLES[0]!)
    expect(input.ownerId).toBe(MOCK_VEHICLES[0]!.ownerId)
    expect(input.images).toHaveLength(3)
    expect(input.images).not.toBe(MOCK_VEHICLES[0]!.images)
    expect(Object.keys(input).sort()).toEqual(Object.keys(emptyVehicleInput()).sort())
  })
})
