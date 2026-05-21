import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, BackendError } from '@/lib/backend'
import type { NotifyMeRequest } from '@/lib/types'

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
    const requests = await backendFetch<NotifyMeRequest[]>(`/v1/admin/crm/notify-me${suffix}`)
    return NextResponse.json(requests)
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
