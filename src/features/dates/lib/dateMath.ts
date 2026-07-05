import type { ImportantDate } from '../types'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function nextOccurrence(date: ImportantDate, today: Date): Date {
  const occurrence = parseLocalDate(date.date)
  if (date.recurring) {
    occurrence.setFullYear(today.getFullYear())
    if (occurrence < today) occurrence.setFullYear(today.getFullYear() + 1)
  }
  return occurrence
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

export function countdownLabel(days: number): string {
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 30) return `in ${days} days`
  if (days < 60) return 'in about a month'
  return `in ${Math.round(days / 30)} months`
}

// "412 days" for a young couple; "2 years, 3 months" once it's been a while.
export function togetherLabel(days: number): string {
  if (days < 365) return `${days} day${days === 1 ? '' : 's'}`
  const years = Math.floor(days / 365.25)
  const months = Math.floor((days - years * 365.25) / 30.44)
  const y = `${years} year${years === 1 ? '' : 's'}`
  return months > 0 ? `${y}, ${months} month${months === 1 ? '' : 's'}` : y
}

// The soonest upcoming occurrence across a list of dates (recurring dates
// resolved to their next anniversary), or undefined if there are none.
export function findNextUpcoming(
  dates: ImportantDate[] | undefined,
  today: Date
): { date: ImportantDate; occurrence: Date } | undefined {
  return dates
    ?.map((date) => ({ date, occurrence: nextOccurrence(date, today) }))
    .filter(({ occurrence }) => occurrence >= today)
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())[0]
}
