"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../lib/locale'

export default function CancelApplicationButton({ 
  applicationId,
  proposedPrice,
  locale 
}: { 
  applicationId: string
  proposedPrice: number | null
  locale: string
}) {
  const { t } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCancel = async () => {
    const refundCredits = proposedPrice ? (proposedPrice / 100).toFixed(1) : '0'
    const confirmMessage = t('taskDetail.cancelApplication.confirm') || 
      `Cancel your application?\n\n✓ ${refundCredits} credits will be refunded\n✓ You can apply again later`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess(true)
        // Trigger global credit update event for Header
        window.dispatchEvent(new CustomEvent('creditsUpdated'))
        setTimeout(() => {
          router.refresh()
        }, 800)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to cancel application')
      }
    } catch (err) {
      setError(t('taskDetail.cancelApplication.error') || 'Failed to cancel application')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        padding: '12px 16px',
        background: '#d1fae5',
        border: '1px solid #10b981',
        borderRadius: '8px',
        color: '#065f46',
        fontWeight: 600,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ✓ {t('taskDetail.cancelApplication.success') || 'Application cancelled. Credits refunded!'}
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div style={{
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: 'var(--radius-sm)',
          color: '#c00',
          marginBottom: '12px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="btn"
        style={{
          background: 'transparent',
          border: '2px solid #ef4444',
          color: '#ef4444',
          padding: '8px 16px',
          fontSize: '0.9rem',
          fontWeight: 600,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = '#ef4444'
            e.currentTarget.style.color = 'white'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#ef4444'
        }}
      >
        {loading ? '⏳ ' + (t('taskDetail.cancelApplication.cancelling') || 'Cancelling...') : '✕ ' + (t('taskDetail.cancelApplication.cancel') || 'Cancel Application')}
      </button>
      {proposedPrice && (
        <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '8px' }}>
          💰 {Math.max(1, Math.ceil(proposedPrice / 100))} Ⓓ {t('taskDetail.cancelApplication.creditsRefund') || 'will be refunded'}
        </div>
      )}
    </div>
  )
}
