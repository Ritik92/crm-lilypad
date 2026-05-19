import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, BackendError } from '@/lib/backend'
import type { Lead } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status')

  const qs = new URLSearchParams()
  if (from) qs.set('from', from)
  if (to) qs.set('to', to)
  if (status) qs.set('status', status)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''

  try {
    const leads = await backendFetch<Lead[]>(`/v1/admin/crm/leads${suffix}`)
    return NextResponse.json(leads)
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const created = await backendFetch<Lead>('/v1/admin/crm/leads', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
