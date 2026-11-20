import type { VehicleService } from '~/services/contracts'
import type { AdminVehicle, AdminVehicleRow, VehicleInput, VehicleStatus } from '~/types/admin'
import { canTransition, VEHICLE_ACTIONS, VEHICLE_STATUSES } from '~/utils/vehicle-status'
import { audit, clone, db, delay, invalid, listItems, nextId, notFound, now } from './db'

const text = (a: string, b: string) => a.localeCompare(b)

export function toRow(v: AdminVehicle): AdminVehicleRow {
  const make = db.makes.find((m) => m.id === v.makeId)
  const model = db.models.find((m) => m.id === v.modelId)
  const owner = db.owners.find((o) => o.id === v.ownerId)
  return { ...clone(v), makeName: make?.name ?? '—', modelName: model?.name ?? '—', ownerName: owner?.name ?? '—' }
}

function find(id: number): AdminVehicle {
  return db.vehicles.find((v) => v.id === id) ?? notFound('Vehicle')
}

function requireComplete(input: VehicleInput) {
  if (!input.ownerId || !input.makeId || !input.modelId || !input.year) invalid('Owner, make, model and year are required.')
}

function fromInput(input: VehicleInput): Omit<AdminVehicle, 'id' | 'reference' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'> {
  return {
    ...clone(input),
    ownerId: input.ownerId!,
    makeId: input.makeId!,
    modelId: input.modelId!,
    year: input.year!,
    mileageKm: input.mileageKm ?? 0,
    priceKes: input.priceKes ?? 0,
    engineCc: input.engineCc ?? 0,
    doors: input.doors ?? 4,
    seats: input.seats ?? 5,
  }
}

export function createVehicleService(actor: () => string): VehicleService {
  return {
    async list(query) {
      await delay()
      return listItems(db.vehicles.map(toRow), query, {
        search: (v) => `${v.reference} ${v.title} ${v.makeName} ${v.modelName} ${v.ownerName} ${v.location}`,
        status: (v) => v.status,
        filters: {
          make: (v, value) => String(v.makeId) === value,
          type: (v, value) => v.listingType === value,
          location: (v, value) => v.location === value,
          owner: (v, value) => String(v.ownerId) === value,
        },
        sorts: {
          createdAt: (a, b) => text(a.createdAt, b.createdAt),
          price: (a, b) => (a.priceKes ?? 0) - (b.priceKes ?? 0),
          year: (a, b) => a.year - b.year,
          mileage: (a, b) => (a.mileageKm ?? 0) - (b.mileageKm ?? 0),
          title: (a, b) => text(a.title, b.title),
        },
        defaultSort: '-createdAt',
      })
    },

    async get(id) {
      await delay()
      return toRow(find(id))
    },

    async create(input, intent) {
      await delay()
      requireComplete(input)
      const id = nextId(db.vehicles)
      const status: VehicleStatus = intent === 'submit' ? 'pending_approval' : 'draft'
      const stamp = now()
      const vehicle: AdminVehicle = {
        ...fromInput(input),
        id,
        reference: `CS-${1000 + id}`,
        status,
        createdBy: actor(),
        createdAt: stamp,
        updatedAt: stamp,
        submittedAt: intent === 'submit' ? stamp : undefined,
      }
      db.vehicles.push(vehicle)
      audit(actor(), 'created', 'Vehicles', `Vehicle ${vehicle.reference}`, intent === 'submit' ? 'Created and submitted for review' : 'Created as draft')
      if (intent === 'submit') db.reviews.push({ id: nextId(db.reviews), vehicleId: id, action: 'submitted', actorName: actor(), createdAt: stamp })
      return clone(vehicle)
    },

    async update(id, input, intent) {
      await delay()
      requireComplete(input)
      const vehicle = find(id)
      if (!canTransition(vehicle.status, 'edit')) invalid(`A ${vehicle.status.replace('_', ' ')} vehicle cannot be edited.`)
      Object.assign(vehicle, fromInput(input), { updatedAt: now() })
      // A change to a published listing goes back to review so unreviewed details never appear publicly.
      const needsReview = intent === 'submit' || vehicle.status === 'published' || vehicle.status === 'unavailable'
      if (needsReview) {
        vehicle.status = 'pending_approval'
        vehicle.submittedAt = now()
        db.reviews.push({ id: nextId(db.reviews), vehicleId: id, action: 'submitted', actorName: actor(), createdAt: now() })
      }
      audit(actor(), 'updated', 'Vehicles', `Vehicle ${vehicle.reference}`, needsReview ? 'Updated and sent for review' : 'Updated')
      return clone(vehicle)
    },

    async transition(id, action, reason) {
      await delay()
      const vehicle = find(id)
      const rule = VEHICLE_ACTIONS[action]
      if (!rule.to || !canTransition(vehicle.status, action)) invalid(`Cannot ${rule.label.toLowerCase()} a vehicle that is ${vehicle.status.replace('_', ' ')}.`)
      if (action === 'reject' && (reason?.trim().length ?? 0) < 20) {
        invalid('A rejection reason of at least 20 characters is required.', { reason: ['Explain what must be corrected (at least 20 characters).'] })
      }
      const from = vehicle.status
      vehicle.status = rule.to
      vehicle.updatedAt = now()
      if (action === 'submit') vehicle.submittedAt = now()
      if (action === 'submit' || action === 'approve' || action === 'reject') {
        db.reviews.push({
          id: nextId(db.reviews),
          vehicleId: id,
          action: action === 'submit' ? 'submitted' : action === 'approve' ? 'approved' : 'rejected',
          reason: action === 'reject' ? reason!.trim() : undefined,
          actorName: actor(),
          createdAt: now(),
        })
      }
      audit(actor(), action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'status_changed',
        action === 'approve' || action === 'reject' ? 'Listing Reviews' : 'Vehicles', `Vehicle ${vehicle.reference}`, `${from} → ${rule.to}`)
      return clone(vehicle)
    },

    async statusCounts() {
      await delay(0)
      return Object.fromEntries(VEHICLE_STATUSES.map((s) => [s.value, db.vehicles.filter((v) => v.status === s.value).length]))
    },

    async stats() {
      await delay()
      const byStatus = Object.fromEntries(VEHICLE_STATUSES.map((s) => [s.value, db.vehicles.filter((v) => v.status === s.value).length])) as Record<VehicleStatus, number>
      return { byStatus, total: db.vehicles.length, newEnquiries: db.enquiries.filter((e) => e.status === 'new').length }
    },

    async recent(limit) {
      await delay()
      return [...db.vehicles].sort((a, b) => text(b.updatedAt, a.updatedAt)).slice(0, limit).map(toRow)
    },

    async activity(vehicleId) {
      await delay(0)
      const ref = find(vehicleId).reference
      return clone(db.audit.filter((a) => a.entity === `Vehicle ${ref}`))
    },

    async uploadImages(files) {
      await delay()
      // Prototype: previews stay in the browser (object URLs); nothing is uploaded.
      return files.map((file) => ({ id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, url: URL.createObjectURL(file), name: file.name, isPrimary: false }))
    },

    async reviews(vehicleId) {
      await delay(0)
      return clone(db.reviews.filter((r) => r.vehicleId === vehicleId).sort((a, b) => text(b.createdAt, a.createdAt)))
    },
  }
}
