import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { status, notes, demoDate, product } = body

  const lead = await db.lead.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(product !== undefined && { product }),
      ...(demoDate !== undefined && {
        demoDate: demoDate ? new Date(demoDate) : null,
      }),
    },
  })

  return NextResponse.json(lead)
}
