"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useLocale from '../../../../lib/locale'
import { MOLDOVA_CITIES, CURRENCY_SYMBOL } from '../../../../lib/constants'

export default function CreateTaskPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [locationTouched, setLocationTouched] = useState(false)
  const [titleTouched, setTitleTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [hiredUserId, setHiredUserId] = useState<string | null>(null)
  const [hiredUserName, setHiredUserName] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useLocale()

  const editId = useMemo(() => searchParams.get('edit') || '', [searchParams])

  useEffect(() => {
    // Check if we're hiring someone
    const storedUserId = sessionStorage.getItem('hiredUserId')
    const storedUserName = sessionStorage.getItem('hiredUserName')
    if (storedUserId) {
      setHiredUserId(storedUserId)
      setHiredUserName(storedUserName)
      // Clear from sessionStorage
      sessionStorage.removeItem('hiredUserId')
      sessionStorage.removeItem('hiredUserName')
    }
  }, [])

  useEffect(() => {
    if (!editId) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/tasks/${editId}`)
        if (!res.ok) throw new Error('Failed to load task')
        const task = await res.json()
        setTitle(task.title || '')
        setDescription(task.description || '')
        setLocation(task.location || '')
        setPrice(task.price != null ? String(Number(task.price).toFixed(2)) : '')
        setError('')
      } catch (e) {
        setError('Failed to load task for editing.')
      } finally {
        setLoading(false)
      }
    })()
  }, [editId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const payload = {
        title,
        description,
        price: price ? parseFloat(price) : null,
        location: location || null
      }
      const url = editId ? `/api/tasks/${editId}` : '/api/tasks'
      const method = editId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(editId ? 'Failed to update task' : 'Failed to create task')
      }
      const result = await response.json()
      const taskId = result?.id || editId
      
      // If user selected an image, upload it
      if (imageFile && taskId) {
        const form = new FormData()
        form.append('image', imageFile)
        await fetch(`/api/tasks/${taskId}/images`, {
          method: 'POST',
          body: form
        })
      }

      // If we're hiring someone, send them an offer
      if (hiredUserId && taskId && !editId) {
        try {
          console.log('Sending job offer to:', hiredUserId, 'for task:', taskId)
          const offerResponse = await fetch(`/api/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: taskId,
              userId: hiredUserId,
              proposedPrice: price ? parseFloat(price) : null,
              message: `Job offer for: ${title}`
            })
          })
          const offerData = await offerResponse.json()
          console.log('Offer response:', offerResponse.status, offerData)
          if (!offerResponse.ok) {
            console.error('Failed to send offer:', offerData)
          }
        } catch (err) {
          console.error('Failed to send offer:', err)
        }
      }

      router.push(`/${locale}/tasks/${taskId}?updated=1`)
    } catch (err) {
      setError(editId ? 'Failed to update task. Please try again.' : 'Failed to create task. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            {editId ? (t('create.editTitle') || 'Edit Task') : (t('create.title') || 'Post a Task')}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('create.help.subtitle') || 'Tell us what you need and get offers from skilled professionals'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card" style={{ padding: '40px' }}>
          {hiredUserId && (
            <div style={{
              padding: '16px',
              background: 'var(--accent-light)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)',
              marginBottom: '24px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💼 Creating task to hire {hiredUserName}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{
                padding: '16px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: 'var(--radius-sm)',
                color: '#c00'
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('create.taskTitleLabel') || 'Task Title *'}
              </label>
              <input 
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                onBlur={() => setTitleTouched(true)}
                placeholder={t('create.taskTitlePlaceholder') || 'e.g., Need help moving furniture'} 
                required
                style={{ fontSize: '1rem' }}
              />
              {titleTouched && !title && (
                <p style={{ fontSize: '0.875rem', color: 'var(--danger)', marginTop: '6px', fontWeight: 600 }}>
                  {t('create.taskTitleRequired') || 'Please enter a task title.'}
                </p>
              )}
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)',
                marginTop: '6px'
              }}>
                {t('create.taskTitleHelp') || 'Be specific and clear about what you need'}
              </p>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('create.descriptionLabel') || 'Description *'}
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                onBlur={() => setDescriptionTouched(true)}
                placeholder={t('create.descriptionPlaceholder') || 'Describe your task in detail. Include any specific requirements, location, timing, etc.'} 
                required
                rows={6}
                style={{ fontSize: '1rem', resize: 'vertical' }}
              />
              {descriptionTouched && !description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--danger)', marginTop: '6px', fontWeight: 600 }}>
                  {t('create.descriptionRequired') || 'Please enter a description.'}
                </p>
              )}
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)',
                marginTop: '6px'
              }}>
                {t('create.descriptionHelp') || 'Provide as much detail as possible to get accurate quotes'}
              </p>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('create.budgetLabel') || 'Budget (Optional)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {CURRENCY_SYMBOL}
                </span>
                <input 
                  type="number"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{ paddingLeft: '48px', fontSize: '1rem' }}
                />
              </div>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)',
                marginTop: '6px'
              }}>
                {t('create.budgetHelp') || 'Set a budget or leave blank to receive offers'}
              </p>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('create.locationLabel') || 'Location *'}
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => setLocationTouched(true)}
                required
                style={{ fontSize: '1rem', width: '100%' }}
              >
                <option value="">{t('create.locationPlaceholder') || 'Select a city'}</option>
                {MOLDOVA_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {locationTouched && !location && (
                <p style={{ fontSize: '0.875rem', color: 'var(--danger)', marginTop: '6px', fontWeight: 600 }}>
                  {t('create.locationRequired') || 'Please select a location.'}
                </p>
              )}
            </div>

            

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('create.photoLabel') || 'Add a Photo (Optional)'}
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{ fontSize: '1rem' }}
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {t('create.photoHelp') || 'Supported: JPG, PNG, WEBP. Max ~5MB.'}
              </p>
            </div>

            <div style={{ 
              paddingTop: '16px',
              borderTop: '1px solid var(--border)'
            }}>
              <button 
                type="submit"
                className="btn" 
                disabled={loading}
                style={{ 
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '14px 24px',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (editId ? (t('create.saving') || 'Saving...') : (t('create.creating') || 'Creating...')) : (editId ? (t('create.saveChanges') || '✓ Save Changes') : (t('create.createTask') || '✓ Create Task'))}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div style={{ 
          marginTop: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>{t('create.tips.title') || '💡 Tips for a Great Task Post'}</h3>
          <ul style={{ 
            lineHeight: '1.8',
            color: 'var(--text-secondary)',
            paddingLeft: '24px'
          }}>
            <li>{t('create.tips.item1') || 'Be specific about what you need done'}</li>
            <li>{t('create.tips.item2') || 'Include location and timing requirements'}</li>
            <li>{t('create.tips.item3') || 'Set a realistic budget based on market rates'}</li>
            <li>{t('create.tips.item4') || 'Add photos if they help explain the task'}</li>
            <li>{t('create.tips.item5') || 'Respond promptly to offers and questions'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
