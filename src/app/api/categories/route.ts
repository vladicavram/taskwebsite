import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const cats = await prisma.category.findMany()
  return NextResponse.json(cats)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const cat = await prisma.category.create({ data: { name } })
  return NextResponse.json(cat)
}
