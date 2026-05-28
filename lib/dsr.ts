import type { Lead } from './types'

export interface DsrMetric {
  label: string
  value: number
  emphasize?: boolean
}

export interface DsrReport {
  dateLabel: string
  rows: DsrMetric[]
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function formatDateLabel(d: Date): string {
  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${day} ${month}, ${d.getFullYear()}`
}

export function computeDsr(leads: Lead[], now: Date = new Date()): DsrReport {
  const today = startOfDay(now)
  const monthStart = startOfMonth(now)
  const sevenDaysOut = new Date(today)
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)

  let mtdLeads = 0
  let leadsToday = 0
  let meaningfulToday = 0
  let oldFollowUps = 0
  let mtdHomeDemos = 0
  let homeDemoToday = 0
  let demosNext7 = 0
  let mtdSales = 0
  let salesToday = 0
  let callBack = 0
  let notResponding = 0

  for (const l of leads) {
    const created = parseDate(l.createdAt)
    const confirmed = parseDate(l.confirmedDemoAt)
    // Fall back to createdAt when backend doesn't expose updatedAt — better than nothing.
    const updated = parseDate(l.updatedAt ?? null) ?? created

    if (created) {
      if (created >= monthStart) mtdLeads++
      if (isSameDay(created, today)) {
        leadsToday++
        if (l.crmStatus !== 'LEAD' && l.crmStatus !== 'NOT_RESPONDING') {
          meaningfulToday++
        }
      } else {
        if (l.crmStatus === 'FIRST_FOLLOW_UP' || l.crmStatus === 'SECOND_FOLLOW_UP') {
          oldFollowUps++
        }
      }
    }

    if (confirmed) {
      if (confirmed >= monthStart && confirmed < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)) {
        mtdHomeDemos++
      }
      if (isSameDay(confirmed, today)) homeDemoToday++
      if (confirmed > today && confirmed <= sevenDaysOut) demosNext7++
    }

    if (l.crmStatus === 'SALE') {
      const saleDate = updated
      if (saleDate) {
        if (saleDate >= monthStart) mtdSales++
        if (isSameDay(saleDate, today)) salesToday++
      }
    }

    if (l.crmStatus === 'CALL_BACK') callBack++
    if (l.crmStatus === 'NOT_RESPONDING') notResponding++
  }

  return {
    dateLabel: formatDateLabel(now),
    rows: [
      { label: 'MTD Leads Received', value: mtdLeads },
      { label: 'Leads Received Today', value: leadsToday, emphasize: true },
      { label: 'Meaningful conversations today', value: meaningfulToday, emphasize: true },
      { label: 'Follow-ups with old leads', value: oldFollowUps },
      { label: 'MTD Home Demos', value: mtdHomeDemos },
      { label: 'Home Demo today', value: homeDemoToday, emphasize: true },
      { label: 'Home demo (next 7 days)', value: demosNext7 },
      { label: 'MTD Sales', value: mtdSales },
      { label: 'Today sales', value: salesToday, emphasize: true },
      { label: 'Leads to call back', value: callBack },
      { label: 'Not responding', value: notResponding },
      { label: 'Leads from "on ground" activity', value: 0 },
    ],
  }
}
