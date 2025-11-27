'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../lib/locale'

type Props = {
  locale: string
  taskId: string
  initial: {
    title: string
    description: string
    location: string | null
    price: number | null
  }
}

export default function EditTaskInline({ locale, taskId, initial }: Props) {
  const { t } = useLocale()
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [location, setLocation] = useState(initial.location || '')
  const [price, setPrice] = useState(
    initial.price != null ? String(Number(initial.price).toFixed(2)) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location: location || null,
          price: price ? parseFloat(price) : null,
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      router.refresh()
    } catch (err) {
      setError(t('taskDetail.edit.errorAlert') || 'Failed to update task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
        }}>
          {error}
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('taskDetail.edit.title') || 'Title'}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('taskDetail.edit.description') || 'Description'}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('taskDetail.edit.location') || 'Location'}</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('taskDetail.edit.budget') || 'Budget (optional)'}</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0" style={{ paddingLeft: 24 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn" disabled={loading} style={{ padding: '10px 14px' }}>
          {loading ? (t('taskDetail.edit.saving') || 'Saving...') : (t('taskDetail.edit.save') || '✓ Save')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.refresh()} style={{ padding: '10px 14px' }}>
          {t('taskDetail.edit.cancel') || 'Cancel'}
        </button>
      </div>
    </form>
  )
}
