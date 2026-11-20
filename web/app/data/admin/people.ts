/** PROTOTYPE MOCK DATA: owners and admin users. Fictional people and businesses. */
import type { AdminUserRecord, Owner } from '~/types/admin'

export const MOCK_OWNERS: Owner[] = [
  { id: 1, type: 'individual', name: 'James Mwangi', contactPerson: '', phone: '+254 712 345 678', whatsapp: '+254 712 345 678', email: 'j.mwangi@example.com', location: 'Nairobi', status: 'active', notes: 'Prefers calls after 5pm.', createdAt: '2026-06-02T08:30:00Z' },
  { id: 2, type: 'business', name: 'Coastline Motors Ltd', contactPerson: 'Amina Hassan', phone: '+254 722 110 220', whatsapp: '+254 722 110 220', email: 'sales@coastline.example', location: 'Mombasa', status: 'active', notes: 'Consigns 3–5 vehicles a month.', createdAt: '2026-05-14T10:00:00Z' },
  { id: 3, type: 'individual', name: 'Grace Wambui', contactPerson: '', phone: '+254 733 456 789', whatsapp: '', email: 'grace.w@example.com', location: 'Nairobi', status: 'active', notes: '', createdAt: '2026-07-21T12:15:00Z' },
  { id: 4, type: 'business', name: 'Rift Valley Auto Traders', contactPerson: 'Peter Kiprono', phone: '+254 701 222 333', whatsapp: '+254 701 222 333', email: 'info@riftauto.example', location: 'Nakuru', status: 'active', notes: 'Logbooks held at their Nakuru office.', createdAt: '2026-04-03T09:00:00Z' },
  { id: 5, type: 'individual', name: 'Daniel Ochieng', contactPerson: '', phone: '+254 745 678 901', whatsapp: '+254 745 678 901', email: '', location: 'Kisumu', status: 'active', notes: '', createdAt: '2026-08-11T14:40:00Z' },
  { id: 6, type: 'individual', name: 'Mercy Chebet', contactPerson: '', phone: '+254 710 987 654', whatsapp: '', email: 'mercy.chebet@example.com', location: 'Eldoret', status: 'active', notes: 'Vehicle kept at home; viewing by appointment.', createdAt: '2026-09-01T07:50:00Z' },
  { id: 7, type: 'business', name: 'Nairobi Premium Cars', contactPerson: 'Samuel Njoroge', phone: '+254 720 555 010', whatsapp: '+254 720 555 010', email: 'fleet@npc.example', location: 'Nairobi', status: 'active', notes: 'Main source of new stock.', createdAt: '2026-03-18T11:20:00Z' },
  { id: 8, type: 'individual', name: 'Fatuma Ali', contactPerson: '', phone: '+254 739 321 654', whatsapp: '+254 739 321 654', email: '', location: 'Mombasa', status: 'active', notes: '', createdAt: '2026-09-25T16:05:00Z' },
  { id: 9, type: 'individual', name: 'Kevin Mutua', contactPerson: '', phone: '+254 708 112 233', whatsapp: '', email: 'k.mutua@example.com', location: 'Machakos', status: 'inactive', notes: 'Vehicle sold privately; keep record.', createdAt: '2026-02-10T09:30:00Z' },
  { id: 10, type: 'business', name: 'Lakeside Car Hub', contactPerson: 'Brenda Akinyi', phone: '+254 724 909 808', whatsapp: '+254 724 909 808', email: 'hello@lakeside.example', location: 'Kisumu', status: 'active', notes: '', createdAt: '2026-06-30T13:00:00Z' },
  { id: 11, type: 'individual', name: 'Joseph Kariuki', contactPerson: '', phone: '+254 711 404 505', whatsapp: '+254 711 404 505', email: 'joe.kariuki@example.com', location: 'Thika', status: 'active', notes: '', createdAt: '2026-10-08T10:10:00Z' },
  { id: 12, type: 'individual', name: 'Lucy Nyambura', contactPerson: '', phone: '+254 727 606 707', whatsapp: '', email: 'lucy.n@example.com', location: 'Nairobi', status: 'active', notes: 'Relocating abroad; motivated seller.', createdAt: '2026-10-29T15:45:00Z' },
]

export const MOCK_USERS: AdminUserRecord[] = [
  { id: 1, name: 'Development Admin', email: 'admin@example.com', roles: ['super-admin'], isActive: true, lastLoginAt: '2026-11-19T07:55:00Z', createdAt: '2026-01-05T08:00:00Z' },
  { id: 2, name: 'Wanjiru Kamau', email: 'wanjiru@carshowcase.example', roles: ['vehicle-manager'], isActive: true, lastLoginAt: '2026-11-18T16:20:00Z', createdAt: '2026-02-12T08:00:00Z' },
  { id: 3, name: 'Brian Otieno', email: 'brian@carshowcase.example', roles: ['reviewer'], isActive: true, lastLoginAt: '2026-11-19T06:40:00Z', createdAt: '2026-02-12T08:05:00Z' },
  { id: 4, name: 'Faith Njeri', email: 'faith@carshowcase.example', roles: ['enquiry-manager'], isActive: true, lastLoginAt: '2026-11-18T18:02:00Z', createdAt: '2026-03-01T09:00:00Z' },
  { id: 5, name: 'Grace Achieng', email: 'grace@carshowcase.example', roles: ['reviewer', 'enquiry-manager'], isActive: true, lastLoginAt: '2026-11-15T11:30:00Z', createdAt: '2026-05-20T09:00:00Z' },
  { id: 6, name: 'Collins Kiptoo', email: 'collins@carshowcase.example', roles: ['vehicle-manager'], isActive: false, lastLoginAt: '2026-08-02T10:00:00Z', createdAt: '2026-04-11T09:00:00Z' },
]
