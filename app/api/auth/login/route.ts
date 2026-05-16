import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sessionOptions, SessionData } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const hash = process.env.ADMIN_PASSWORD
  if (!hash) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const valid = await bcrypt.compare(password, hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
