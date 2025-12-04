import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, price } = await req.json()

    if (!amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, create a Stripe payment intent here
    // For now, return a mock response
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: Math.round(price * 100), // Stripe uses cents
      currency: 'usd',
      status: 'requires_payment_method',
      credits: amount
    }

    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
