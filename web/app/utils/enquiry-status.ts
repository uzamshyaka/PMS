import type { EnquiryStatus } from '~/types/admin'

export const ENQUIRY_STATUSES: { value: EnquiryStatus, label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow-up Required' },
  { value: 'closed', label: 'Closed' },
]

export const enquiryStatusLabel = (s: EnquiryStatus) => ENQUIRY_STATUSES.find((x) => x.value === s)?.label ?? s
