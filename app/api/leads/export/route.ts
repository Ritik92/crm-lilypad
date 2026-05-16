import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stringify } from 'csv-stringify/sync'

const ALL_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'status',
  'product',
  'demoDate',
  'notes',
  'createdAt',
] as const

type Field = (typeof ALL_FIELDS)[number]

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const fieldsParam = searchParams.get('fields')

  const fields: Field[] = fieldsParam
    ? (fieldsParam
        .split(',')
        .filter((f) => ALL_FIELDS.includes(f as Field)) as Field[])
    : [...ALL_FIELDS]

  const leads = await db.lead.findMany({
    where:
      from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to + 'T23:59:59.999Z') }),
            },
          }
        : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const rows = leads.map((lead) =>
    Object.fromEntries(
      fields.map((f) => {
        const val = lead[f as keyof typeof lead]
        if (val instanceof Date) return [f, val.toISOString()]
        return [f, val ?? '']
      })
    )
  )

  const csv = stringify(rows, { header: true, columns: fields as string[] })
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="lilypad-leads-${date}.csv"`,
    },
  })
}
