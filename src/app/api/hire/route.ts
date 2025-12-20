import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      select: {
        id: true,
        credits: true,
        blocked: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.blocked) {
      return NextResponse.json({ error: 'Your account is blocked' }, { status: 403 })
    }

    const body = await req.json()
    const { workerId, title, description, price, location } = body

    if (!workerId || !title || !description || !location) {
      return NextResponse.json({ 
        error: 'Worker ID, title, description, and location are required' 
      }, { status: 400 })
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Check if worker exists and can apply
    const worker = await prisma.user.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    if (!worker.canApply || worker.blocked) {
      return NextResponse.json({ error: 'Worker is not available' }, { status: 400 })
    }

    // Create the task
    const task = await prisma.task.create({ 
      data: { 
        title, 
        description, 
        price: parsedPrice,
        location,
        creatorId: user.id
        // Note: isDirectHire will be set to true after database migration
      } 
    })

    // Create a notification for the worker
    await prisma.notification.create({
      data: {
        userId: workerId,
        taskId: task.id,
        type: 'hire_request',
        content: `Someone wants to hire you for: "${title}"`
      }
    })

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Hire request sent successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Hire request error:', error)
    return NextResponse.json({ error: 'Failed to send hire request' }, { status: 500 })
  }
}
