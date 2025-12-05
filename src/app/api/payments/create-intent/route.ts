import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }
    
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, price } = await req.json()

    if (!amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Price is in MDL - Stripe doesn't support MDL, so we use EUR
    // 1 EUR ≈ 19.5 MDL
    const eurAmount = Math.round((price / 19.5) * 100) // Convert to cents

    // Use fetch directly to Stripe API
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'amount': eurAmount.toString(),
        'currency': 'eur',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[userId]': session.user.id || '',
        'metadata[userEmail]': session.user.email,
        'metadata[credits]': amount.toString(),
        'metadata[mdlPrice]': price.toString(),
      }).toString()
    })

    const paymentIntent = await response.json()

    if (!response.ok) {
      console.error('Stripe API error:', paymentIntent)
      return NextResponse.json({ error: paymentIntent.error?.message || 'Stripe error' }, { status: 400 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      credits: amount
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to create payment intent' }, { status: 500 })
  }
}
