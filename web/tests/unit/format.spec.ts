import { describe, expect, it } from 'vitest'
import { formatDate, formatKes, formatKm } from '~/utils/format'

describe('format', () => {
  it('formats Kenyan Shillings without decimals', () => {
    expect(formatKes(5490000)).toBe('KES 5,490,000')
    expect(formatKes(999.6)).toBe('KES 1,000')
    expect(formatKes(null)).toBe('—')
    expect(formatKm(undefined)).toBe('—')
  })

  it('formats kilometres', () => {
    expect(formatKm(45000)).toBe('45,000 km')
  })

  it('formats dates independently of the local timezone', () => {
    expect(formatDate('2026-10-02')).toBe('2 Oct 2026')
    // Timestamps are shown in Nairobi time (UTC+3): 22:30 UTC is already the next day.
    expect(formatDate('2026-10-02T22:30:00Z')).toBe('3 Oct 2026')
  })
})
