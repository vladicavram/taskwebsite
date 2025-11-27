import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, username, password } = await req.json()
    if (!email || (!username && !password)) {
      return NextResponse.json({ error: 'Provide email and at least one of username/password' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const data: any = {}
    if (typeof username === 'string') {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
      }
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      data.username = username
    }
    if (typeof password === 'string') {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      data.password = bcrypt.hashSync(password, 10)
    }

    const updated = await prisma.user.update({ where: { email }, data })
    return NextResponse.json({ id: updated.id, email: updated.email, username: updated.username, name: updated.name })
  } catch (error) {
    console.error('Admin reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
