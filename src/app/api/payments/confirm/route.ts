import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentIntentId, amount, price } = await req.json()

    if (!paymentIntentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In production, verify payment with Stripe here
    // For now, directly update credits

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          increment: amount
        }
      }
    })

    // Create transaction record
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'purchase',
        description: `Purchased ${amount} credit${amount > 1 ? 's' : ''} for $${price}`,
        paymentIntentId
      }
    })

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
      transaction
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
