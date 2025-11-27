'use client'

import { useState } from 'react'
import useLocale from '../lib/locale'

type ReviewFormProps = {
  taskId: string
  recipientId: string
  recipientName: string
  onSuccess?: () => void
}

export default function ReviewForm({ taskId, recipientId, recipientName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const { t } = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError(t('review.selectRating') || 'Please select a rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          recipientId,
          rating,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
      setRating(0)
      setComment('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        padding: '20px',
        background: 'var(--accent-light)',
        border: '2px solid var(--accent)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--accent)',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        ✓ {t('review.thankYou') || 'Thank you for your review!'}
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>
        {t('review.rateUser') || 'Rate'} {recipientName}
      </h3>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 'var(--radius-sm)',
            color: '#c00',
            marginBottom: '16px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            {t('review.rating') || 'Rating'} *
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '2rem',
                  padding: 0,
                  transition: 'transform 0.2s',
                  transform: (hoverRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {(hoverRating >= star || rating >= star) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            {t('review.comment') || 'Comment'} ({t('review.optional') || 'optional'})
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('review.commentPlaceholder') || 'Share your experience...'}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="btn"
          style={{ 
            width: '100%',
            background: 'var(--accent)',
            color: 'white'
          }}
        >
          {loading ? (t('review.submitting') || 'Submitting...') : (t('review.submit') || 'Submit Review')}
        </button>
      </form>
    </div>
  )
}
