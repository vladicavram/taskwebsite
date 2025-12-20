'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCY_SYMBOL } from '../../../../lib/constants'

export default function HireRequestActions({ 
  applicationId, 
  taskPrice, 
  locale,
  userCredits
}: { 
  applicationId: string
  taskPrice: number
  locale: string
  userCredits: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')

  async function handleAccept() {
    if (userCredits < 1) {
      alert('You need at least 1 credit to accept this hire request. Please purchase credits first.')
      return
    }

    if (!confirm(`Accept this hire request for ${taskPrice} ${CURRENCY_SYMBOL}? This will deduct 1 credit from your account.`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to accept hire request')
      }
    } catch (error) {
      alert('Failed to accept hire request')
    }
    setLoading(false)
  }

  async function handleDecline() {
    if (!confirm('Decline this hire request?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      })

      if (res.ok) {
        router.push(`/${locale}/tasks`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to decline hire request')
      }
    } catch (error) {
      alert('Failed to decline hire request')
    }
    setLoading(false)
  }

  async function handleCounterOffer() {
    const price = parseFloat(counterPrice)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/counter-offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedPrice: price })
      })

      if (res.ok) {
        setShowCounterOffer(false)
        setCounterPrice('')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send counter-offer')
      }
    } catch (error) {
      alert('Failed to send counter-offer')
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Hire Request</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        You've been hired for this task at {taskPrice} {CURRENCY_SYMBOL}. 
        {userCredits < 1 && (
          <span style={{ display: 'block', marginTop: '8px', color: '#ef4444', fontWeight: 600 }}>
            ⚠️ You need at least 1 credit to accept this request.
          </span>
        )}
      </p>

      {!showCounterOffer ? (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAccept}
            disabled={loading || userCredits < 1}
            className="btn"
            style={{ 
              flex: 1,
              padding: '14px',
              fontSize: '1.1rem',
              opacity: (loading || userCredits < 1) ? 0.6 : 1,
              cursor: (userCredits < 1) ? 'not-allowed' : 'pointer'
            }}
          >
            ✓ Accept {taskPrice} {CURRENCY_SYMBOL}
          </button>
          <button
            onClick={() => setShowCounterOffer(true)}
            disabled={loading}
            className="btn btn-secondary"
            style={{ 
              flex: 1,
              padding: '14px',
              fontSize: '1.1rem'
            }}
          >
            💬 Counter-Offer
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="btn"
            style={{ 
              flex: 1,
              padding: '14px',
              fontSize: '1.1rem',
              background: '#ef4444'
            }}
          >
            ✗ Decline
          </button>
        </div>
      ) : (
        <div>
          <label style={{ 
            display: 'block', 
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            Your Counter-Offer Price
          </label>
          <input
            type="number"
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            placeholder={`Current: ${taskPrice}`}
            min="0"
            step="0.01"
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCounterOffer}
              disabled={loading}
              className="btn"
              style={{ 
                flex: 1,
                opacity: loading ? 0.6 : 1
              }}
            >
              Send Counter-Offer
            </button>
            <button
              onClick={() => {
                setShowCounterOffer(false)
                setCounterPrice('')
              }}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
