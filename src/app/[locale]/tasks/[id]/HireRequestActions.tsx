'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCY_SYMBOL } from '../../../../lib/constants'

export default function HireRequestActions({ 
  applicationId, 
  taskPrice, 
  locale,
  userCredits,
  proposedPrice,
  lastProposedByIsApplicant
}: { 
  applicationId: string
  taskPrice: number
  locale: string
  userCredits: number
  proposedPrice?: number
  lastProposedByIsApplicant?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')

  async function handleAccept() {
    const requiredCredits = (proposedPrice || taskPrice) / 100

    // If the applicant themselves last proposed the price (they sent a counter-offer), they cannot
    // accept that counter-offer themselves; only the creator may accept a counter-offer. Block here.
    if (lastProposedByIsApplicant) {
      alert('You cannot accept your own counter-offer; only the task creator can accept a counter-offer.')
      return
    }

    if (userCredits < requiredCredits) {
      // Show inline message instead of alert; keep button disabled in UI.
      alert(`You need at least ${requiredCredits} credits to accept this hire request. Please purchase credits first.`)
      return
    }

    if (!confirm(`Accept this hire request for ${taskPrice} ${CURRENCY_SYMBOL}?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/hires/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', confirm: true })
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
      const res = await fetch(`/api/hires/${applicationId}`, {
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
      const res = await fetch(`/api/hires/${applicationId}/counter-offer`, {
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
      </p>

      {!showCounterOffer ? (
        lastProposedByIsApplicant ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Counter-offer sent</div>
            <div style={{ marginBottom: 12, color: 'var(--text-muted)' }}>
              You proposed {proposedPrice ?? taskPrice} {CURRENCY_SYMBOL}. Waiting for the creator to accept or respond.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowCounterOffer(true)}
                disabled={loading}
                className="btn btn-secondary"
              >
                ✏️ Send another counter-offer
              </button>
            </div>
          </div>
        ) : (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <button
              onClick={handleAccept}
              disabled={loading || userCredits < ((proposedPrice || taskPrice) / 100)}
              className="btn"
              style={{ 
                width: '100%',
                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669',
                opacity: (loading || userCredits < ((proposedPrice || taskPrice) / 100)) ? 0.5 : 1,
                cursor: (userCredits < ((proposedPrice || taskPrice) / 100)) ? 'not-allowed' : 'pointer'
              }}
            >
              ✓ Accept {proposedPrice || taskPrice} {CURRENCY_SYMBOL}
            </button>
            {userCredits < ((proposedPrice || taskPrice) / 100) && (
              <div style={{ marginTop: 8, fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div>Insufficient credits to accept this hire request.</div>
                <a href={`/${locale}/profile/credits/purchase`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.9rem' }}>Buy Credits</a>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCounterOffer(true)}
            disabled={loading}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            💬 Counter-Offer
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="btn"
            style={{ 
              flex: 1,
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
              borderColor: '#dc2626'
            }}
          >
            ✗ Decline
          </button>
        </div>
        )
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
                opacity: loading ? 0.5 : 1
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
