'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../lib/locale'

interface DeleteTaskButtonProps {
  taskId: string
  locale: string
}

export default function DeleteTaskButton({ taskId, locale }: DeleteTaskButtonProps) {
  const { t } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert(t('taskDetail.delete.successAlert') || 'Task deleted successfully')
        router.push(`/${locale}/tasks`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || (t('taskDetail.delete.errorAlert') || 'Failed to delete task'))
      }
    } catch (err) {
      alert(t('taskDetail.delete.errorAlert') || 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: '#ef4444',
            color: '#fff',
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontWeight: 500,
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          {t('taskDetail.delete.button') || 'Delete'}
        </button>
      ) : (
        <div style={{
          padding: '12px',
          background: '#fff',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          marginTop: '8px',
          maxWidth: '420px'
        }}>
          <p style={{ 
            color: '#7f1d1d', 
            fontWeight: 500, 
            marginBottom: '10px',
            fontSize: '0.9rem'
          }}>
            {t('taskDetail.delete.confirmText') || 'Are you sure? This action cannot be undone. All applications and notifications will be deleted.'}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn"
              style={{
                flex: 1,
                background: '#ef4444',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (t('taskDetail.delete.deleting') || 'Deleting...') : (t('taskDetail.delete.confirmButton') || 'Delete')}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px' }}
            >
              {t('taskDetail.delete.cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
