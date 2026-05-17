import { NextRequest, NextResponse } from 'next/server'
import { stringify } from 'csv-stringify/sync'
import { backendFetch, BackendError } from '@/lib/backend'
import type { Lead } from '@/lib/types'

const ALL_FIELDS = [
  'fullName',
  'email',
  'mobileNumber',
  'addressLine',
  'pincode',
  'productName',
  'productBrand',
  'crmStatus',
  'bookingStatus',
  'demoDate',
  'timeSlot',
  'confirmedDemoAt',
  'crmNotes',
  'createdAt',
] as const

type Field = (typeof ALL_FIELDS)[number]

const FIELD_LABELS: Record<Field, string> = {
  fullName: 'Name',
  email: 'Email',
  mobileNumber: 'Phone',
  addressLine: 'Address',
  pincode: 'Pincode',
  productName: 'Product',
  productBrand: 'Brand',
  crmStatus: 'CRM Status',
  bookingStatus: 'Booking Status',
  demoDate: 'Requested Demo Date',
  timeSlot: 'Requested Slot',
  confirmedDemoAt: 'Confirmed Demo At',
  crmNotes: 'Notes',
  createdAt: 'Created At',
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const fieldsParam = searchParams.get('fields')

  const fields: Field[] = fieldsParam
    ? (fieldsParam.split(',').filter((f) => ALL_FIELDS.includes(f as Field)) as Field[])
    : [...ALL_FIELDS]

  const qs = new URLSearchParams()
  if (from) qs.set('from', from)
  if (to) qs.set('to', to)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''

  let leads: Lead[]
  try {
    leads = await backendFetch<Lead[]>(`/v1/admin/crm/leads${suffix}`)
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }

  const rows = leads.map((lead) =>
    Object.fromEntries(
      fields.map((f) => {
        const val = lead[f as keyof Lead]
        return [FIELD_LABELS[f], val ?? '']
      })
    )
  )

  const csv = stringify(rows, {
    header: true,
    columns: fields.map((f) => FIELD_LABELS[f]),
  })
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="lilypad-leads-${date}.csv"`,
    },
  })
}
