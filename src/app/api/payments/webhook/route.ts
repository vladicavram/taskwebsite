import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This endpoint handles Stripe webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    let event: Stripe.Event

    // Verify webhook signature if webhook secret is configured
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        )
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
      }
    } else {
      event = JSON.parse(body)
    }

    // Handle different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, userEmail, credits } = paymentIntent.metadata
        
        if (userEmail && credits) {
          const creditsToAdd = parseFloat(credits)
          
          // Find user and add credits
          const user = await prisma.user.findUnique({
            where: { email: userEmail }
          })
          
          if (user) {
            // Update user credits
            await prisma.user.update({
              where: { id: user.id },
              data: { credits: { increment: creditsToAdd } }
            })
            
            // Create transaction record
            await prisma.creditTransaction.create({
              data: {
                userId: user.id,
                amount: creditsToAdd,
                type: 'purchase',
                description: `Purchased ${creditsToAdd} credits via Stripe`,
                paymentIntentId: paymentIntent.id
              }
            })
            
            console.log(`Added ${creditsToAdd} credits to user ${userEmail}`)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
