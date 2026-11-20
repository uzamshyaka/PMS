/** PROTOTYPE MOCK DATA: enquiries, audit entries, website content and settings. Not real activity. */
import type { AuditLog, ContentSection, ContentValues, Enquiry, EnquiryStatus } from '~/types/admin'

type E = [id: number, name: string, phone: string, email: string, vehicleId: number | null, status: EnquiryStatus, assignedToId: number | null, at: string, message: string]

const ENQUIRIES: E[] = [
  [1, 'Peter Kamau', '+254 712 000 111', 'peter.k@example.com', 1, 'new', null, '2026-11-19T07:42:00Z', 'Is the GLC still available? I would like to view it this Saturday.'],
  [2, 'Achieng Odhiambo', '+254 723 000 222', '', 7, 'new', null, '2026-11-19T06:15:00Z', 'What deposit is required for Lipa Mdogo Mdogo on the Evoque?'],
  [3, 'Mohamed Abdi', '+254 734 000 333', 'm.abdi@example.com', 5, 'new', 4, '2026-11-18T19:05:00Z', 'Can I get the service history for the X3?'],
  [4, 'Sharon Wanjiku', '+254 745 000 444', 'sharon.w@example.com', null, 'new', null, '2026-11-18T15:30:00Z', 'Do you have any 7-seater SUVs under KES 5M?'],
  [5, 'David Kiprop', '+254 701 000 555', '', 9, 'contacted', 4, '2026-11-17T11:20:00Z', 'Interested in the Prado. Is the price negotiable?'],
  [6, 'Esther Muthoni', '+254 710 000 666', 'esther.m@example.com', 2, 'contacted', 5, '2026-11-17T09:10:00Z', 'Please share the Lipa Mdogo Mdogo terms for the 5 Series.'],
  [7, 'Ali Hassan', '+254 722 000 777', '', 12, 'follow_up', 4, '2026-11-16T14:45:00Z', 'Would like a test drive in Mombasa next week.'],
  [8, 'Nancy Chepkoech', '+254 733 000 888', 'nancy.c@example.com', 10, 'follow_up', 5, '2026-11-15T10:00:00Z', 'Can you deliver the CX-5 to Eldoret?'],
  [9, 'John Mwenda', '+254 744 000 999', 'john.mwenda@example.com', 6, 'closed', 4, '2026-11-12T16:30:00Z', 'Is the C-Class accident free?'],
  [10, 'Ruth Atieno', '+254 711 111 000', '', 3, 'closed', 5, '2026-11-11T08:25:00Z', 'What is the fuel consumption of the Corolla Cross hybrid?'],
  [11, 'Brian Kibet', '+254 722 222 000', 'b.kibet@example.com', 11, 'new', null, '2026-11-18T21:10:00Z', 'Is the Golf GTI still available?'],
  [12, 'Mary Wairimu', '+254 733 333 000', 'mary.w@example.com', 8, 'contacted', 4, '2026-11-14T13:50:00Z', 'Can I view the A4 in Nakuru on Friday?'],
  [13, 'Tom Onyango', '+254 744 444 000', '', 4, 'follow_up', 4, '2026-11-13T17:35:00Z', 'Would you accept a trade-in?'],
  [14, 'Halima Yusuf', '+254 755 555 000', 'halima.y@example.com', 30, 'new', null, '2026-11-17T20:00:00Z', 'Please send more interior photos of the Discovery.'],
  [15, 'George Maina', '+254 766 666 000', 'g.maina@example.com', 23, 'closed', 5, '2026-10-02T09:00:00Z', 'Interested in the Land Cruiser 300.'],
]

const STAFF: Record<number, string> = { 4: 'Faith Njeri', 5: 'Grace Achieng' }
const ORDER: EnquiryStatus[] = ['new', 'contacted', 'follow_up', 'closed']
const later = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString()

export const MOCK_ENQUIRIES: Enquiry[] = ENQUIRIES.map(([id, customerName, phone, email, vehicleId, status, assignedToId, createdAt, message]) => ({
  id,
  customerName,
  phone,
  email,
  vehicleId,
  message,
  status,
  assignedToId,
  createdAt,
  history: ORDER.slice(0, ORDER.indexOf(status) + 1).map((s, i) => ({
    status: s,
    at: later(createdAt, i * 5),
    by: i === 0 ? 'Website form' : STAFF[assignedToId ?? 4] ?? 'Faith Njeri',
    note: s === 'contacted' ? 'Called the customer.' : s === 'follow_up' ? 'Customer asked to call back.' : undefined,
  })),
  notes: status === 'new' ? [] : [{ id: id * 10, body: 'Customer prefers WhatsApp.', author: STAFF[assignedToId ?? 4] ?? 'Faith Njeri', at: later(createdAt, 2) }],
}))

const AUDIT: [string, string, string, string, string, string][] = [
  ['2026-11-19T07:55:00Z', 'Development Admin', 'login', 'Authentication', 'User #1', 'Signed in'],
  ['2026-11-18T16:40:00Z', 'Brian Otieno', 'approved', 'Listing Reviews', 'Vehicle CS-1001', 'Approved and published'],
  ['2026-11-18T12:00:00Z', 'Wanjiru Kamau', 'created', 'Vehicles', 'Vehicle CS-1018', 'Created as draft'],
  ['2026-11-18T09:40:00Z', 'Wanjiru Kamau', 'submitted', 'Vehicles', 'Vehicle CS-1013', 'Submitted for review'],
  ['2026-11-17T18:02:00Z', 'Faith Njeri', 'status_changed', 'Enquiries', 'Enquiry #5', 'new → contacted'],
  ['2026-11-17T14:00:00Z', 'Development Admin', 'submitted', 'Vehicles', 'Vehicle CS-1014', 'Submitted for review'],
  ['2026-11-17T10:30:00Z', 'Development Admin', 'created', 'Vehicles', 'Vehicle CS-1019', 'Created as draft'],
  ['2026-11-16T15:10:00Z', 'Development Admin', 'updated', 'Website', 'Homepage', 'Updated hero text'],
  ['2026-11-15T11:30:00Z', 'Grace Achieng', 'login', 'Authentication', 'User #5', 'Signed in'],
  ['2026-11-12T13:00:00Z', 'Brian Otieno', 'rejected', 'Listing Reviews', 'Vehicle CS-1021', 'Rejected: photos unclear'],
  ['2026-11-10T10:00:00Z', 'Wanjiru Kamau', 'updated', 'Vehicles', 'Vehicle CS-1006', 'Price changed'],
  ['2026-11-09T08:30:00Z', 'Development Admin', 'role_assigned', 'Users & Roles', 'User #5', 'Assigned enquiry-manager'],
  ['2026-11-08T16:00:00Z', 'Wanjiru Kamau', 'created', 'Owners', 'Owner #12', 'Owner created'],
  ['2026-11-06T13:30:00Z', 'Brian Otieno', 'rejected', 'Listing Reviews', 'Vehicle CS-1022', 'Rejected: price check'],
  ['2026-11-03T09:00:00Z', 'Development Admin', 'updated', 'Settings', 'General settings', 'Changed contact email'],
  ['2026-10-30T17:00:00Z', 'Wanjiru Kamau', 'status_changed', 'Vehicles', 'Vehicle CS-1023', 'published → sold'],
  ['2026-10-29T15:45:00Z', 'Wanjiru Kamau', 'created', 'Owners', 'Owner #12', 'Owner created'],
  ['2026-10-25T10:40:00Z', 'Collins Kiptoo', 'status_changed', 'Vehicles', 'Vehicle CS-1026', 'published → unavailable'],
  ['2026-10-20T08:00:00Z', 'Development Admin', 'deactivated', 'Users & Roles', 'User #6', 'Account deactivated'],
  ['2026-10-12T12:50:00Z', 'Development Admin', 'created', 'Catalogue', 'Make Isuzu', 'Make added'],
]

export const MOCK_AUDIT_LOGS: AuditLog[] = AUDIT.map(([at, userName, action, module, entity, details], i) => ({ id: i + 1, at, userName, action, module, entity, details }))

export const MOCK_CONTENT: Record<ContentSection, ContentValues> = {
  homepage: {
    heroEyebrow: 'Quality cars. Trusted service.',
    heroTitle: 'Drive',
    heroScript: 'Excellence',
    heroSubtitle: 'Discover quality vehicles selected for your next journey.',
    featuredVehicleIds: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  about: {
    title: 'Quality vehicles, clearly presented',
    intro: 'Car Showcase presents quality vehicles with the information buyers actually need.',
    body: 'Our team prepares and reviews every listing before it goes live, so what you see online is what you will find in the showroom.',
  },
  contact: {
    phone: '+254 700 000 000',
    whatsapp: '254700000000',
    email: 'hello@carshowcase.example',
    address: 'Showroom address, Nairobi, Kenya',
    hours: 'Mon–Sat, 8:00 – 18:00',
  },
  branding: {
    siteName: 'Car Showcase',
    tagline: 'Quality Vehicles',
    accentColour: '#b08d57',
    logoUrl: '',
  },
  seo: {
    metaTitle: 'Car Showcase: Quality Cars, Trusted Service',
    metaDescription: 'Browse new and used vehicles in Kenya. Cash and Lipa Mdogo Mdogo options. Contact our showroom team directly.',
    ogImageUrl: '',
  },
  settings: {
    siteName: 'Car Showcase',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    currencySymbol: 'KES',
    priceDecimals: 0,
    contactEmail: 'hello@carshowcase.example',
    contactPhone: '+254 700 000 000',
    listingsPerPage: 9,
    showSoldVehicles: false,
    maxImageSizeMb: 8,
    maxImagesPerVehicle: 20,
    allowedImageTypes: 'JPEG, PNG, WebP',
  },
}
