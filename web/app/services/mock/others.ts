/**
 * Mock implementations of the non-vehicle admin services.
 */
import type {
  AuditService, CatalogueItem, CatalogueService, ContentService, EnquiryService, NotificationService, OwnerService, UserService,
} from '~/services/contracts'
import type { AdminUserRecord, Enquiry, EnquiryRow, Notification, Owner, OwnerRow, VehicleFeature, VehicleMake, VehicleModel } from '~/types/admin'
import { PERMISSIONS, ROLE_DEFINITIONS } from '~/utils/permissions'
import { audit, clone, db, delay, invalid, listItems, nextId, notFound, now } from './db'
import { toRow } from './vehicles'

const text = (a: string, b: string) => a.localeCompare(b)

// ---------------------------------------------------------------- owners

function ownerRow(o: Owner): OwnerRow {
  return { ...clone(o), vehicleCount: db.vehicles.filter((v) => v.ownerId === o.id).length }
}

export function createOwnerService(actor: () => string): OwnerService {
  const find = (id: number) => db.owners.find((o) => o.id === id) ?? notFound('Owner')
  const ensureUniquePhone = (phone: string, id?: number) => {
    const digits = phone.replace(/\D/g, '')
    if (db.owners.some((o) => o.id !== id && o.phone.replace(/\D/g, '') === digits)) {
      invalid('Another owner already uses this phone number.', { phone: ['Another owner already uses this phone number.'] })
    }
  }

  return {
    async list(query) {
      await delay()
      return listItems(db.owners.map(ownerRow), query, {
        search: (o) => `${o.name} ${o.contactPerson} ${o.phone} ${o.email} ${o.location}`,
        status: (o) => o.status,
        filters: { type: (o, v) => o.type === v },
        sorts: { createdAt: (a, b) => text(a.createdAt, b.createdAt), name: (a, b) => text(a.name, b.name), vehicles: (a, b) => a.vehicleCount - b.vehicleCount },
        defaultSort: '-createdAt',
      })
    },
    async all() {
      await delay(0)
      return clone(db.owners.filter((o) => o.status === 'active').sort((a, b) => text(a.name, b.name)))
    },
    async get(id) {
      await delay()
      return ownerRow(find(id))
    },
    async create(input) {
      await delay()
      ensureUniquePhone(input.phone)
      const owner: Owner = { ...clone(input), id: nextId(db.owners), createdAt: now() }
      db.owners.push(owner)
      audit(actor(), 'created', 'Owners', `Owner #${owner.id}`, 'Owner created')
      return clone(owner)
    },
    async update(id, input) {
      await delay()
      ensureUniquePhone(input.phone, id)
      const owner = Object.assign(find(id), clone(input))
      audit(actor(), 'updated', 'Owners', `Owner #${id}`, 'Owner updated')
      return clone(owner)
    },
    async setStatus(id, status) {
      await delay()
      const owner = find(id)
      owner.status = status
      audit(actor(), status === 'active' ? 'activated' : 'deactivated', 'Owners', `Owner #${id}`, `Owner ${status === 'active' ? 'activated' : 'deactivated'}`)
      return clone(owner)
    },
    async vehicles(id) {
      await delay(0)
      return db.vehicles.filter((v) => v.ownerId === id).sort((a, b) => text(b.createdAt, a.createdAt)).map(toRow)
    },
    async activity(id) {
      await delay(0)
      return clone(db.audit.filter((a) => a.entity === `Owner #${id}`))
    },
  }
}

// ---------------------------------------------------------------- enquiries

function enquiryRow(e: Enquiry): EnquiryRow {
  const vehicle = e.vehicleId ? db.vehicles.find((v) => v.id === e.vehicleId) : undefined
  const staff = e.assignedToId ? db.users.find((u) => u.id === e.assignedToId) : undefined
  return { ...clone(e), vehicleTitle: vehicle?.title ?? null, assignedToName: staff?.name ?? null }
}

export function createEnquiryService(actor: () => string): EnquiryService {
  const find = (id: number) => db.enquiries.find((e) => e.id === id) ?? notFound('Enquiry')
  return {
    async list(query) {
      await delay()
      return listItems(db.enquiries.map(enquiryRow), query, {
        search: (e) => `${e.customerName} ${e.phone} ${e.email} ${e.vehicleTitle ?? ''} ${e.message}`,
        status: (e) => e.status,
        filters: { assigned: (e, v) => (v === 'unassigned' ? e.assignedToId === null : String(e.assignedToId) === v) },
        sorts: { createdAt: (a, b) => text(a.createdAt, b.createdAt), customer: (a, b) => text(a.customerName, b.customerName) },
        defaultSort: '-createdAt',
      })
    },
    async get(id) {
      await delay()
      return enquiryRow(find(id))
    },
    async updateStatus(id, status, note) {
      await delay()
      const enquiry = find(id)
      if (enquiry.status === status) invalid('The enquiry already has this status.')
      const from = enquiry.status
      enquiry.status = status
      enquiry.history.push({ status, at: now(), by: actor(), note: note?.trim() || undefined })
      audit(actor(), 'status_changed', 'Enquiries', `Enquiry #${id}`, `${from} → ${status}`)
      return clone(enquiry)
    },
    async assign(id, userId) {
      await delay()
      const enquiry = find(id)
      enquiry.assignedToId = userId
      const name = userId ? db.users.find((u) => u.id === userId)?.name : 'nobody'
      audit(actor(), 'assigned', 'Enquiries', `Enquiry #${id}`, `Assigned to ${name}`)
      return clone(enquiry)
    },
    async addNote(id, body) {
      await delay()
      if (!body.trim()) invalid('Note cannot be empty.', { body: ['Write a note first.'] })
      const enquiry = find(id)
      enquiry.notes.push({ id: nextId(enquiry.notes), body: body.trim(), author: actor(), at: now() })
      return clone(enquiry)
    },
    async statusCounts() {
      await delay(0)
      return db.enquiries.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }), {})
    },
    async recent(limit) {
      await delay()
      return [...db.enquiries].sort((a, b) => text(b.createdAt, a.createdAt)).slice(0, limit).map(enquiryRow)
    },
    async assignees() {
      await delay(0)
      return db.users.filter((u) => u.isActive && u.roles.some((r) => r === 'enquiry-manager' || r === 'super-admin')).map((u) => ({ id: u.id, name: u.name }))
    },
  }
}

// ---------------------------------------------------------------- catalogue

export function createCatalogueService(actor: () => string): CatalogueService {
  const tables = () => ({ makes: db.makes, models: db.models, features: db.features }) as Record<string, CatalogueItem[]>
  return {
    async makes() { await delay(); return clone(db.makes).sort((a, b) => text(a.name, b.name)) },
    async models() { await delay(); return clone(db.models).sort((a, b) => text(a.name, b.name)) },
    async features() { await delay(); return clone(db.features).sort((a, b) => text(a.category, b.category) || text(a.name, b.name)) },
    async save(kind, item) {
      await delay()
      const table = tables()[kind]!
      const name = String(item.name ?? '').trim()
      if (!name) invalid('Name is required.', { name: ['Name is required.'] })
      const sameScope = (row: CatalogueItem) => kind !== 'models' || (row as VehicleModel).makeId === (item as Partial<VehicleModel>).makeId
      if (table.some((row) => row.id !== item.id && row.name.toLowerCase() === name.toLowerCase() && sameScope(row))) {
        invalid(`"${name}" already exists.`, { name: [`"${name}" already exists.`] })
      }
      if (kind === 'models' && !(item as Partial<VehicleModel>).makeId) invalid('Choose a make.', { makeId: ['Choose a make.'] })
      if (kind === 'features' && !(item as Partial<VehicleFeature>).category) invalid('Choose a category.', { category: ['Choose a category.'] })

      if (item.id) {
        const row = table.find((r) => r.id === item.id) ?? notFound('Item')
        Object.assign(row, clone(item), { name })
        audit(actor(), 'updated', 'Catalogue', `${kind.slice(0, -1)} ${name}`, 'Updated')
        return clone(row)
      }
      const row = { isActive: true, ...clone(item), name, id: nextId(table) } as VehicleMake & VehicleModel & VehicleFeature
      table.push(row)
      audit(actor(), 'created', 'Catalogue', `${kind.slice(0, -1)} ${name}`, 'Added')
      return clone(row)
    },
    async setActive(kind, id, isActive) {
      await delay()
      const row = tables()[kind]!.find((r) => r.id === id) ?? notFound('Item')
      row.isActive = isActive
      audit(actor(), isActive ? 'activated' : 'deactivated', 'Catalogue', `${kind.slice(0, -1)} ${row.name}`, isActive ? 'Activated' : 'Deactivated')
    },
  }
}

// ---------------------------------------------------------------- users

export function createUserService(actor: () => string): UserService {
  const find = (id: number) => db.users.find((u) => u.id === id) ?? notFound('User')
  const ensureUniqueEmail = (email: string, id?: number) => {
    if (db.users.some((u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
      invalid('This email is already in use.', { email: ['This email is already in use.'] })
    }
  }
  return {
    async list(query) {
      await delay()
      return listItems(db.users, query, {
        search: (u) => `${u.name} ${u.email}`,
        status: (u) => (u.isActive ? 'active' : 'inactive'),
        filters: { role: (u, v) => u.roles.includes(v) },
        sorts: { name: (a, b) => text(a.name, b.name), createdAt: (a, b) => text(a.createdAt, b.createdAt), lastLogin: (a, b) => text(a.lastLoginAt ?? '', b.lastLoginAt ?? '') },
        defaultSort: 'name',
      })
    },
    async all() { await delay(0); return clone(db.users) },
    async get(id) { await delay(); return clone(find(id)) },
    async create(input) {
      await delay()
      ensureUniqueEmail(input.email)
      if (!input.roles.length) invalid('Assign at least one role.', { roles: ['Assign at least one role.'] })
      const user: AdminUserRecord = { ...clone(input), id: nextId(db.users), lastLoginAt: null, createdAt: now() }
      db.users.push(user)
      audit(actor(), 'created', 'Users & Roles', `User #${user.id}`, `Created with roles: ${input.roles.join(', ')}`)
      return clone(user)
    },
    async update(id, input) {
      await delay()
      ensureUniqueEmail(input.email, id)
      if (!input.roles.length) invalid('Assign at least one role.', { roles: ['Assign at least one role.'] })
      const user = Object.assign(find(id), clone(input))
      audit(actor(), 'updated', 'Users & Roles', `User #${id}`, `Roles: ${input.roles.join(', ')}; ${input.isActive ? 'active' : 'inactive'}`)
      return clone(user)
    },
    async roles() {
      await delay()
      return ROLE_DEFINITIONS.map((r) => ({ ...r, permissions: [...r.permissions], userCount: db.users.filter((u) => u.roles.includes(r.name)).length }))
    },
    async activity(id) {
      await delay(0)
      return clone(db.audit.filter((a) => a.entity === `User #${id}`))
    },
  }
}

// ---------------------------------------------------------------- content

export function createContentService(actor: () => string): ContentService {
  return {
    async get(section) { await delay(); return clone(db.content[section]) },
    async save(section, values) {
      await delay()
      db.content[section] = clone(values)
      audit(actor(), 'updated', section === 'settings' ? 'Settings' : 'Website', section, 'Content updated')
      return clone(values)
    },
    async uploadImage(file) {
      await delay()
      return URL.createObjectURL(file)
    },
  }
}

// ---------------------------------------------------------------- audit

export function createAuditService(): AuditService {
  return {
    async list(query) {
      await delay()
      return listItems(db.audit, query, {
        search: (a) => `${a.userName} ${a.action} ${a.module} ${a.entity} ${a.details}`,
        filters: {
          user: (a, v) => a.userName === v,
          action: (a, v) => a.action === v,
          module: (a, v) => a.module === v,
          from: (a, v) => a.at.slice(0, 10) >= v,
          to: (a, v) => a.at.slice(0, 10) <= v,
        },
        sorts: { at: (a, b) => text(a.at, b.at) },
        defaultSort: '-at',
      })
    },
    async facets() {
      await delay(0)
      const uniq = (values: string[]) => [...new Set(values)].sort()
      return { users: uniq(db.audit.map((a) => a.userName)), actions: uniq(db.audit.map((a) => a.action)), modules: uniq(db.audit.map((a) => a.module)) }
    },
  }
}

// ---------------------------------------------------------------- notifications

export function createNotificationService(): NotificationService {
  return {
    async list(can) {
      await delay(0)
      const items: Notification[] = []
      if (can(PERMISSIONS.enquiries)) {
        for (const e of db.enquiries.filter((e) => e.status === 'new').slice(0, 5)) {
          items.push({ id: `enquiry-${e.id}`, title: `New enquiry from ${e.customerName}`, description: e.message, to: `/admin/enquiries/${e.id}`, at: e.createdAt })
        }
      }
      if (can(PERMISSIONS.reviews)) {
        for (const v of db.vehicles.filter((v) => v.status === 'pending_approval').slice(0, 5)) {
          items.push({ id: `review-${v.id}`, title: 'Listing awaiting review', description: v.title, to: `/admin/reviews/${v.id}`, at: v.submittedAt ?? v.updatedAt })
        }
      }
      return items.sort((a, b) => text(b.at, a.at))
    },
  }
}
