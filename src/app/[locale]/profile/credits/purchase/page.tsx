'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../../lib/locale'
import { Coins, CreditCard, Check } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../../../lib/constants'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CREDIT_PACKAGES = [
  { amount: 5, price: 50, popular: false },
  { amount: 10, price: 100, popular: true },
  { amount: 20, price: 180, popular: false, save: '10%' },
  { amount: 50, price: 400, popular: false, save: '20%' },
  { amount: 100, price: 750, popular: false, save: '25%' }
]

// Payment Form Component
function CheckoutForm({ clientSecret, amount, price, currency, locale, t, interpolate, onSuccess }: any) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/profile/credits/history?success=true&credits=${amount}`
      }
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div style={{ color: 'var(--error)', marginTop: '16px', padding: '12px', background: 'var(--error-light)', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn"
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1.125rem',
          marginTop: '24px'
        }}
      >
        {processing 
          ? (t('purchaseCredits.processing') || 'Processing...') 
          : interpolate(t('purchaseCredits.purchaseButton') || 'Purchase {{amount}} Credits for {{price}} {{currency}}', { 
              amount: amount, 
              price: price, 
              currency: currency 
            })
        }
      </button>
    </form>
  )
}

export default function PurchaseCreditsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale, t }= useLocale()
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1])
  const [processing, setProcessing] = useState(false)
  const [balance, setBalance] = useState(0)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const interpolate = (str: string, vars: Record<string, any>) => {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
      return
    }
    fetchCredits()
  }, [status, locale])

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/users/credits')
      if (res.ok) {
        const data = await res.json()
        setBalance(data.credits || 0)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const handlePurchase = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackage.amount,
          price: selectedPackage.price
        })
      })

      const data = await res.json()
      
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret)
        setShowPayment(true)
      } else {
        throw new Error(data.error || 'Failed to create payment intent')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert((t('purchaseCredits.error.payment') || 'Payment error: Please try again.') + (error?.message ? ` ${error.message}` : ''))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={28} />
            {t('purchaseCredits.title') || 'Purchase Credits'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {interpolate(t('purchaseCredits.subtitle') || 'Buy credits to apply for tasks (1 credit = 100 {{currency}} task value)', { currency: CURRENCY_SYMBOL })}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Current Balance */}
        <div className="card" style={{ padding: '24px', marginBottom: '32px', textAlign: 'center', background: 'var(--accent-light)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {t('purchaseCredits.currentBalance') || 'Current Balance'}
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Coins size={32} />
            {Number(balance).toFixed(2)}
          </div>
        </div>

        {/* Package Selection */}
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('purchaseCredits.choosePackage') || 'Choose a Package'}</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.amount}
              onClick={() => setSelectedPackage(pkg)}
              className="card"
              style={{
                padding: '24px',
                cursor: 'pointer',
                border: selectedPackage.amount === pkg.amount 
                  ? '3px solid var(--accent)' 
                  : '1px solid var(--border)',
                position: 'relative',
                transition: 'all 0.2s',
                textAlign: 'center',
                background: selectedPackage.amount === pkg.amount 
                  ? 'var(--accent-light)' 
                  : 'white'
              }}
              onMouseEnter={(e) => {
                if (selectedPackage.amount !== pkg.amount) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPackage.amount !== pkg.amount) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {t('purchaseCredits.popular') || 'POPULAR'}
                </div>
              )}

              {selectedPackage.amount === pkg.amount && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--accent)',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={16} />
                </div>
              )}

              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 700, 
                color: 'var(--accent)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Coins size={36} />
                {Number(pkg.amount).toFixed(2)}
              </div>

              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                {pkg.price} {CURRENCY_SYMBOL}
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {interpolate(t('purchaseCredits.perCredit') || '{{price}} {{currency}} per credit', { price: (pkg.price / pkg.amount).toFixed(0), currency: CURRENCY_SYMBOL })}
              </div>

              {pkg.save && (
                <div style={{
                  marginTop: '12px',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {interpolate(t('purchaseCredits.save') || 'Save {{percent}}', { percent: pkg.save })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Purchase Summary */}
        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px' }}>{t('purchaseCredits.orderSummary') || 'Order Summary'}</h3>
          
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('purchaseCredits.credits') || 'Credits'}</span>
            <span style={{ fontWeight: 600 }}>{Number(selectedPackage.amount).toFixed(2)}</span>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('purchaseCredits.pricePerCredit') || 'Price per credit'}</span>
            <span>{(selectedPackage.price / selectedPackage.amount).toFixed(0)} {CURRENCY_SYMBOL}</span>
          </div>

          {selectedPackage.save && (
            <div style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              justifyContent: 'space-between',
              color: 'var(--success)',
              fontWeight: 600
            }}>
              <span>{t('purchaseCredits.savings') || 'Savings'}</span>
              <span>-{((selectedPackage.amount * 10) - selectedPackage.price).toFixed(0)} {CURRENCY_SYMBOL}</span>
            </div>
          )}

          <div style={{ 
            borderTop: '2px solid var(--border)', 
            paddingTop: '16px', 
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 700
          }}>
            <span>{t('purchaseCredits.total') || 'Total'}</span>
            <span style={{ color: 'var(--accent)' }}>{selectedPackage.price} {CURRENCY_SYMBOL}</span>
          </div>
        </div>

        {/* Stripe Payment Form */}
        {showPayment && clientSecret ? (
          <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '24px' }}>{t('purchaseCredits.paymentDetails') || 'Payment Details'}</h3>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6'
                  }
                }
              }}
            >
              <CheckoutForm 
                clientSecret={clientSecret}
                amount={selectedPackage.amount}
                price={selectedPackage.price}
                currency={CURRENCY_SYMBOL}
                locale={locale}
                t={t}
                interpolate={interpolate}
                onSuccess={() => router.push(`/${locale}/profile/credits/history?success=true`)}
              />
            </Elements>
            <button
              onClick={() => { setShowPayment(false); setClientSecret(null) }}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              {t('common.cancel') || 'Cancel'}
            </button>
          </div>
        ) : (
          <>
            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={processing}
              className="btn"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.125rem',
                marginBottom: '16px'
              }}
            >
              {processing 
                ? (t('purchaseCredits.processing') || 'Processing...') 
                : interpolate(t('purchaseCredits.purchaseButton') || 'Purchase {{amount}} Credits for {{price}} {{currency}}', { 
                    amount: selectedPackage.amount, 
                    price: selectedPackage.price, 
                    currency: CURRENCY_SYMBOL 
                  })
              }
            </button>
          </>
        )}

        {/* Payment Info */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '8px' }}>
            {t('purchaseCredits.securePayment') || '🔒 Secure payment powered by Stripe'}
          </p>
          <p>
            {t('purchaseCredits.creditsNeverExpire') || 'Credits never expire and can be used for any task on Dozo'}
          </p>
        </div>
      </div>
    </div>
  )
}
