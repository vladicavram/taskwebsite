import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/authOptions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const priceMin = searchParams.get('priceMin')
  const priceMax = searchParams.get('priceMax')
  const location = searchParams.get('location') || undefined
  const showCompleted = searchParams.get('completed') === 'true'

  const where: any = showCompleted 
    ? { 
        completedAt: { not: null }
      }
    : { 
        isOpen: true,
        completedAt: null,
        applications: {
          none: {
            status: 'accepted'
          }
        }
      }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ]
  }
  if (location) {
    where.location = { contains: location, mode: 'insensitive' }
  }
  if (priceMin || priceMax) {
    where.price = {}
    if (priceMin) where.price.gte = parseFloat(priceMin)
    if (priceMax) where.price.lte = parseFloat(priceMax)
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100
  })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, price, location, categoryId } = body

    if (!title || !description || !location) {
      return NextResponse.json({ error: 'Title, description, and location are required' }, { status: 400 })
    }

    const task = await prisma.task.create({ 
      data: { 
        title, 
        description, 
        price: price ? parseFloat(price) : null,
        location,
        categoryId: categoryId || null,
        creatorId: user.id 
      } 
    })
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
