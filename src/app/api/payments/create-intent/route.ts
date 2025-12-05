import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, price } = await req.json()

    if (!amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create a real Stripe payment intent
    // Price is in MDL - Stripe doesn't support MDL, so we use EUR as proxy
    // 1 EUR ≈ 19.5 MDL, so we convert: MDL / 19.5 = EUR
    const eurAmount = Math.round((price / 19.5) * 100) // Convert to cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: eurAmount,
      currency: 'eur',
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
        credits: amount.toString(),
        mdlPrice: price.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      credits: amount
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message, error.type)
    return NextResponse.json({ error: error.message || 'Failed to create payment intent' }, { status: 500 })
  }
}
