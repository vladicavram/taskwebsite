'use client'
import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  taskId: string
  canEdit: boolean
  showAddOnly?: boolean
}

export default function TaskImageControls({ taskId, canEdit, showAddOnly = false }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)

  const triggerUpload = () => {
    if (!canEdit || busy) return
    fileRef.current?.click()
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await fetch(`/api/tasks/${taskId}/images`, { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Upload failed (${res.status})`)
      }
      router.refresh()
    } catch (err: any) {
      alert(err?.message || 'Failed to upload image')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const deleteImage = async () => {
    if (!canEdit || busy) return
    if (!confirm('Remove the task image?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/images`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch (err) {
      alert('Failed to delete image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: '48px' }}>
      {canEdit && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            onClick={triggerUpload}
            disabled={busy}
            title="Add image"
            aria-label="Add image"
            style={{
              background: 'white',
              border: '2px solid var(--text)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: busy ? 'not-allowed' : 'pointer',
              color: 'var(--text)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              opacity: busy ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!busy) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Plus size={16} strokeWidth={2} />
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            add more
          </span>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
      {!showAddOnly && canEdit && (
        <button
          type="button"
          onClick={deleteImage}
          disabled={busy}
          title="Delete image"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: '0.95rem',
            color: 'var(--danger)',
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          ➖ Delete
        </button>
      )}
    </div>
  )
}
