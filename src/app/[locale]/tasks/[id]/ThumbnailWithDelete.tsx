'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageLightbox from '../../../../components/ImageLightbox'
import { Trash2 } from 'lucide-react'

type Props = {
  src: string
  alt: string
  taskId: string
  canEdit: boolean
  imageName?: string
}

export default function ThumbnailWithDelete({ src, alt, taskId, canEdit, imageName }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (!canEdit || busy) return
    if (!confirm('Do you want to delete this image?')) return
    setBusy(true)
    try {
      const endpoint = imageName
        ? `/api/tasks/images/${encodeURIComponent(imageName)}?taskId=${encodeURIComponent(taskId)}`
        : `/api/tasks/${taskId}/images`
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch (e) {
      alert('Failed to delete image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ImageLightbox src={src} alt={alt} />
      {canEdit && imageName && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          disabled={busy}
          title="Delete image"
          aria-label="Delete image"
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
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
          <Trash2 size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
