import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ id: user.id, username: user.username, email: user.email, name: user.name, image: user.image, isAdmin: user.isAdmin, role: user.role })
}

export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { username, name, password, image } = body

  // Validate username format
  if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
  }

  // Unique checks
  if (username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername && existingUsername.email !== session.user.email) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }
  }
  // Email updates disabled from this route

  const data: any = { }
  if (typeof username === 'string') data.username = username
  if (typeof name === 'string') data.name = name
  // Do not update email here
  if (typeof password === 'string' && password.length >= 8) {
    data.password = bcrypt.hashSync(password, 10)
  }
  if (typeof image === 'string') {
    data.image = image
  }

  const updated = await prisma.user.update({ where: { email: session.user.email }, data })
  return NextResponse.json({ id: updated.id, username: updated.username, email: updated.email, name: updated.name })
}
