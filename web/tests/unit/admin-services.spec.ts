import { beforeEach, describe, expect, it } from 'vitest'
import { createAdminServices } from '~/services'
import { db, resetMockDb } from '~/services/mock/db'
import type { ListQuery } from '~/types/admin'
import { emptyVehicleInput, toVehicleInput } from '~/utils/vehicle-form'

const services = createAdminServices('mock', () => 'Test User')
const q = (extra: Partial<ListQuery> = {}): ListQuery => ({ page: 1, filters: {}, ...extra })
const rejected = (p: Promise<unknown>) => p.then(() => null, (e) => e as { status: number, data: { errors: Record<string, string[]> } })

describe('mock admin services (contract behaviour the API must match)', () => {
  beforeEach(() => resetMockDb())

  it('refuses unknown data sources instead of silently using mocks', () => {
    expect(() => createAdminServices('elsewhere', () => '')).toThrow(/Unknown admin data source/)
    expect(() => createAdminServices('api', () => '')).toThrow(/needs an API client/)
  })

  it('lists vehicles with search, status, filters, sort and pagination meta', async () => {
    const page = await services.vehicles.list(q())
    expect(page.items).toHaveLength(10)
    expect(page.meta).toMatchObject({ current_page: 1, per_page: 10, total: 30, last_page: 3 })
    expect(page.items[0]!.createdAt >= page.items[1]!.createdAt).toBe(true)

    expect((await services.vehicles.list(q({ status: 'pending_approval' }))).meta.total).toBe(5)
    expect((await services.vehicles.list(q({ search: 'harrier' }))).items.map((v) => v.modelName)).toEqual(['Harrier'])
    expect((await services.vehicles.list(q({ filters: { location: 'Mombasa' } }))).items.every((v) => v.location === 'Mombasa')).toBe(true)
    const byPrice = (await services.vehicles.list(q({ sort: 'price', perPage: 100 }))).items.map((v) => v.priceKes)
    expect(byPrice).toEqual([...byPrice].sort((a, b) => a - b))
  })

  it('approval publishes and records history; rejection requires a reason', async () => {
    const err = await rejected(services.vehicles.transition(13, 'reject', 'too short'))
    expect(err?.status).toBe(422)
    expect(err?.data.errors.reason).toBeDefined()

    await services.vehicles.transition(13, 'reject', 'Please upload clear photos of the odometer and rear.')
    expect(db.vehicles.find((v) => v.id === 13)!.status).toBe('rejected')

    await services.vehicles.transition(14, 'approve')
    expect(db.vehicles.find((v) => v.id === 14)!.status).toBe('published')
    const history = await services.vehicles.reviews(14)
    expect(history[0]).toMatchObject({ action: 'approved', actorName: 'Test User' })
    expect(db.audit[0]).toMatchObject({ action: 'approved', module: 'Listing Reviews', userName: 'Test User' })
  })

  it('blocks invalid transitions', async () => {
    expect((await rejected(services.vehicles.transition(1, 'approve')))?.status).toBe(422)
    expect((await rejected(services.vehicles.transition(28, 'mark_sold')))?.status).toBe(422)
  })

  it('creates drafts or submissions, and editing a live listing sends it back to review', async () => {
    const input = { ...emptyVehicleInput(), ownerId: 1, makeId: 1, modelId: 3, year: 2021, title: '2021 Toyota Harrier' }
    const draft = await services.vehicles.create(input, 'draft')
    expect(draft).toMatchObject({ status: 'draft', reference: 'CS-1031', createdBy: 'Test User' })
    expect((await services.vehicles.create(input, 'submit')).status).toBe('pending_approval')
    expect((await rejected(services.vehicles.create({ ...input, ownerId: null }, 'draft')))?.status).toBe(422)

    const live = db.vehicles.find((v) => v.id === 1)!
    await services.vehicles.update(1, { ...toVehicleInput(live), priceKes: 11_500_000 }, 'save')
    expect(db.vehicles.find((v) => v.id === 1)!.status).toBe('pending_approval')
  })

  it('owners: duplicate phone numbers are refused; vehicle counts are computed', async () => {
    const owner = await services.owners.get(7)
    expect(owner.vehicleCount).toBeGreaterThan(0)
    const err = await rejected(services.owners.create({ ...owner, name: 'Copy', phone: '+254720555010' }))
    expect(err?.data.errors.phone).toBeDefined()
  })

  it('enquiries: status changes are recorded in history; notes are added', async () => {
    await services.enquiries.updateStatus(1, 'contacted', 'Called back')
    const e = await services.enquiries.get(1)
    expect(e.status).toBe('contacted')
    expect(e.history.at(-1)).toMatchObject({ status: 'contacted', by: 'Test User', note: 'Called back' })
    await services.enquiries.assign(1, 4)
    expect((await services.enquiries.get(1)).assignedToName).toBe('Faith Njeri')
    expect((await rejected(services.enquiries.addNote(1, '  ')))?.status).toBe(422)
  })

  it('catalogue: no duplicate names; models need a make; deactivate instead of delete', async () => {
    expect((await rejected(services.catalogue.save('makes', { name: 'toyota' })))?.status).toBe(422)
    expect((await rejected(services.catalogue.save('models', { name: 'New Model' })))?.data.errors.makeId).toBeDefined()
    const model = await services.catalogue.save('models', { name: 'Rush', makeId: 1 })
    expect(model).toMatchObject({ name: 'Rush', isActive: true })
    await services.catalogue.setActive('makes', 1, false)
    expect((await services.catalogue.makes()).find((m) => m.id === 1)!.isActive).toBe(false)
  })

  it('users must have a role and a unique email; role summaries count users', async () => {
    expect((await rejected(services.users.create({ name: 'X', email: 'x@example.com', roles: [], isActive: true })))?.data.errors.roles).toBeDefined()
    expect((await rejected(services.users.create({ name: 'X', email: 'ADMIN@example.com', roles: ['reviewer'], isActive: true })))?.data.errors.email).toBeDefined()
    const roles = await services.users.roles()
    expect(roles.find((r) => r.name === 'reviewer')!.userCount).toBe(2)
  })

  it('audit log filters by module and date range', async () => {
    const byModule = await services.audit.list(q({ filters: { module: 'Listing Reviews' } }))
    expect(byModule.items.every((a) => a.module === 'Listing Reviews')).toBe(true)
    const range = await services.audit.list(q({ filters: { from: '2026-11-17', to: '2026-11-17' } }))
    expect(range.items.every((a) => a.at.startsWith('2026-11-17'))).toBe(true)
  })

  it('notifications follow permissions', async () => {
    expect(await services.notifications.list(() => false)).toEqual([])
    const reviewerOnly = await services.notifications.list((p) => p === 'review-vehicle-listings')
    expect(reviewerOnly.every((n) => n.to.startsWith('/admin/reviews/'))).toBe(true)
  })

  it('owner data never reaches the public site data', async () => {
    const publicData = await import('~/data/demo-vehicles')
    expect(JSON.stringify(publicData.DEMO_VEHICLES)).not.toMatch(/\+254 7\d{2}/)
  })
})
