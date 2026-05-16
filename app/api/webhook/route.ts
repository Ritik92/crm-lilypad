import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, phone, address, product } = body

  if (!name || !email || !phone || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await db.lead.findFirst({
    where: {
      email,
      status: { notIn: ['SALE', 'NOT_INTERESTED'] },
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Active lead with this email already exists', leadId: existing.id },
      { status: 409 }
    )
  }

  const lead = await db.lead.create({
    data: { name, email, phone, address, ...(product && { product }) },
  })

  return NextResponse.json(lead, { status: 201 })
}
