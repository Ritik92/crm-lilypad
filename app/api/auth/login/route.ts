import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
