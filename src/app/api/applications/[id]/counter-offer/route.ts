export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the application with task details
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { 
        task: {
          include: {
            creator: true
          }
        },
        applicant: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify that the current user is either task creator or applicant
    const isCreator = application.task.creatorId === user.id
    const isApplicant = application.applicantId === user.id

    if (!isCreator && !isApplicant) {
      return NextResponse.json({ error: 'Unauthorized to modify this application' }, { status: 403 })
    }

    const body = await req.json()
    const { proposedPrice } = body

    if (!proposedPrice || proposedPrice <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Update application with new proposed price
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { 
        proposedPrice: parseFloat(proposedPrice),
        lastProposedBy: user.id
      }
    })

    // Create notification for the other party
    const recipientId = isCreator ? application.applicantId : application.task.creatorId
    const senderName = user.name || user.email
    const notificationContent = isCreator
      ? `${senderName} proposed a counter-offer of ${proposedPrice} MDL for "${application.task.title}"`
      : `${senderName} proposed a price of ${proposedPrice} MDL for "${application.task.title}"`

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'price_counter_offer',
        content: notificationContent,
        taskId: application.taskId,
        applicationId: application.id
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Counter-offer error:', error)
    return NextResponse.json({ error: 'Failed to send counter-offer' }, { status: 500 })
  }
}
