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

  const handleCancel = async () => {
    const refundCredits = proposedPrice ? (proposedPrice / 100).toFixed(2) : '0'
    const confirmMessage = t('taskDetail.cancelApplication.confirm') || 
      `Are you sure you want to cancel your application? ${refundCredits} credits will be refunded to your account.`
    
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
        router.refresh()
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
        className="btn btn-secondary"
        style={{
          background: '#ef4444',
          color: 'white',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (t('taskDetail.cancelApplication.cancelling') || 'Cancelling...') : (t('taskDetail.cancelApplication.cancel') || 'Cancel Application')}
      </button>
    </div>
  )
}
