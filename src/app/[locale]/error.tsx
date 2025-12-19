"use client"
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('=== ROUTE ERROR ===')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Digest:', error.digest)
    console.error('Full error:', error)
  }, [error])

  return (
    <div className="container" style={{ padding: 24 }}>
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error.message || 'Unknown error'}</p>
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error Stack</summary>
            <pre style={{ fontSize: '0.75rem', overflow: 'auto', marginTop: 8 }}>
              {error.stack}
            </pre>
          </details>
        )}
        <button className="btn" onClick={() => reset()} style={{ marginTop: 16 }}>Try again</button>
      </div>
    </div>
  )
}
