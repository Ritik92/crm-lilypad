import type { Lead } from '@/lib/types'

export type AgeFilter = 'today' | '3d' | '7d' | '7d+' | null
export type DemoFilter = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'unscheduled' | null

export type RangeFilter = '1m' | '3m' | '6m' | '1y' | 'all'
export const DEFAULT_RANGE: RangeFilter = '1m'

export const RANGE_OPTIONS: { value: RangeFilter; label: string; days: number | null }[] = [
  { value: '1m', label: 'Last month', days: 30 },
  { value: '3m', label: 'Last 3 months', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'all', label: 'All time', days: null },
]

export function rangeToFromDate(range: RangeFilter): string | null {
  const opt = RANGE_OPTIONS.find((o) => o.value === range)
  if (!opt || opt.days === null) return null
  const d = new Date()
  d.setDate(d.getDate() - opt.days)
  // YYYY-MM-DD in local
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface Filters {
  brands: string[]
  age: AgeFilter
  demo: DemoFilter
}

export const EMPTY_FILTERS: Filters = {
  brands: [],
  age: null,
  demo: null,
}

export const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '3d', label: '≤ 3 days' },
  { value: '7d', label: '≤ 7 days' },
  { value: '7d+', label: '> 7 days' },
]

export const DEMO_OPTIONS: { value: DemoFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'nextWeek', label: 'Next week' },
  { value: 'unscheduled', label: 'No date' },
]

export function hasActiveFilters(f: Filters): boolean {
  return f.brands.length > 0 || f.age !== null || f.demo !== null
}

export function activeFilterCount(f: Filters): number {
  return (f.brands.length > 0 ? 1 : 0) + (f.age ? 1 : 0) + (f.demo ? 1 : 0)
}

export function matchesFilters(lead: Lead, f: Filters): boolean {
  // Brand
  if (f.brands.length > 0) {
    const brand = lead.productBrand ?? '__unknown__'
    if (!f.brands.includes(brand)) return false
  }

  // Age (createdAt)
  if (f.age) {
    const days = daysBetween(new Date(lead.createdAt), new Date())
    if (f.age === 'today' && days !== 0) return false
    if (f.age === '3d' && days > 3) return false
    if (f.age === '7d' && days > 7) return false
    if (f.age === '7d+' && days <= 7) return false
  }

  // Demo timing — uses confirmedDemoAt first, falls back to demoDate
  if (f.demo) {
    const ts = lead.confirmedDemoAt ?? lead.demoDate
    if (f.demo === 'unscheduled') {
      if (ts) return false
    } else {
      if (!ts) return false
      const d = new Date(ts)
      const today = startOfDay(new Date())
      const tomorrow = addDays(today, 1)
      const thisWeekEnd = endOfWeek(today)
      const nextWeekStart = addDays(thisWeekEnd, 1)
      const nextWeekEnd = endOfWeek(nextWeekStart)

      const day = startOfDay(d)

      if (f.demo === 'today' && day.getTime() !== today.getTime()) return false
      if (f.demo === 'tomorrow' && day.getTime() !== tomorrow.getTime()) return false
      if (f.demo === 'thisWeek' && (day < today || day > thisWeekEnd)) return false
      if (f.demo === 'nextWeek' && (day < nextWeekStart || day > nextWeekEnd)) return false
    }
  }

  return true
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// Sunday end of week (treats today's week as Mon–Sun)
function endOfWeek(d: Date): Date {
  const x = startOfDay(d)
  const dow = x.getDay() // 0=Sun..6=Sat
  const daysToSunday = dow === 0 ? 0 : 7 - dow
  return addDays(x, daysToSunday)
}

// ---- URL serialization ----

export function filtersFromSearchParams(params: URLSearchParams): Filters {
  const brandStr = params.get('brand') ?? ''
  const brands = brandStr ? brandStr.split(',').filter(Boolean) : []
  const age = params.get('age') as AgeFilter | null
  const demo = params.get('demo') as DemoFilter | null
  return {
    brands,
    age: AGE_OPTIONS.some((o) => o.value === age) ? age : null,
    demo: DEMO_OPTIONS.some((o) => o.value === demo) ? demo : null,
  }
}

export function rangeFromSearchParams(params: URLSearchParams): RangeFilter {
  const r = params.get('range') as RangeFilter | null
  return RANGE_OPTIONS.some((o) => o.value === r) ? (r as RangeFilter) : DEFAULT_RANGE
}

export function filtersToSearchParams(f: Filters, range: RangeFilter): URLSearchParams {
  const p = new URLSearchParams()
  if (range !== DEFAULT_RANGE) p.set('range', range)
  if (f.brands.length > 0) p.set('brand', f.brands.join(','))
  if (f.age) p.set('age', f.age)
  if (f.demo) p.set('demo', f.demo)
  return p
}
