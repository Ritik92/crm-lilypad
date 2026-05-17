import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, BackendError } from '@/lib/backend'
import type { Lead } from '@/lib/types'

interface PatchBody {
  status?: string
  notes?: string
  confirmedDemoAt?: string | null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await req.json()) as PatchBody

  const payload: Record<string, unknown> = {}
  if (body.status !== undefined) payload.crmStatus = body.status
  if (body.notes !== undefined) payload.crmNotes = body.notes
  if (body.confirmedDemoAt !== undefined) {
    if (body.confirmedDemoAt === null) {
      payload.clearConfirmedDemoAt = true
    } else {
      // Frontend sends local wall-clock as "YYYY-MM-DDTHH:mm:ss" (no zone) —
      // backend's LocalDateTime parses this directly.
      payload.confirmedDemoAt = body.confirmedDemoAt
    }
  }

  try {
    const updated = await backendFetch<Lead>(`/v1/admin/crm/leads/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return NextResponse.json(updated)
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
