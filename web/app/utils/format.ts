// Fixed locale so server-rendered and client-rendered text are identical.
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 5490000 -> "KES 5,490,000"; empty (incomplete drafts) -> "—" */
export function formatKes(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? '—' : `KES ${number.format(amount)}`
}

/** 45000 -> "45,000 km"; empty -> "—" */
export function formatKm(km: number | null | undefined): string {
  return km === null || km === undefined ? '—' : `${number.format(km)} km`
}

/** "2026-10-02" or "2026-10-02T09:15:00Z" -> "2 Oct 2026" (Nairobi time) */
export function formatDate(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: iso.length === 10 ? 'UTC' : 'Africa/Nairobi',
  }).format(date)
}
