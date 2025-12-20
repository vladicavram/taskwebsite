'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelHireButton({ taskId, locale }: { taskId: string; locale: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Cancel this hire request? The task will be deleted.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push(`/${locale}/tasks`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to cancel hire request')
      }
    } catch (error) {
      alert('Failed to cancel hire request')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="btn"
      style={{ 
        background: '#ef4444',
        opacity: loading ? 0.6 : 1
      }}
    >
      Cancel Hire Request
    </button>
  )
}
