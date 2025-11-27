"use client"
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="container" style={{ padding: 24 }}>
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error.message || 'Unknown error'}</p>
        <button className="btn" onClick={() => reset()}>Try again</button>
      </div>
    </div>
  )
}
