"use client"
import { useRouter } from 'next/navigation'

export default function MarkCompleteButton({ taskId, locale, redirectTo }: { taskId: string, locale: string, redirectTo?: string }) {
  const router = useRouter()
  const onClick = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to complete task')
      const target = redirectTo ?? `/${locale}/tasks/${taskId}?updated=1`
      router.replace(target)
    } catch (e) {
      alert('Could not mark task as completed')
    }
  }
  return (
    <button className="btn" onClick={onClick} style={{ fontSize: '0.875rem', padding: '8px 12px' }}>
      Complete
    </button>
  )
}
