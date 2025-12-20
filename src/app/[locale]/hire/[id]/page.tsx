'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getTranslation } from '../../../../lib/locale'
import Link from 'next/link'

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const t = (key: string) => getTranslation(locale, key)
  const router = useRouter()
  const { data: session } = useSession()

  const [worker, setWorker] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showHireModal, setShowHireModal] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPrice, setTaskPrice] = useState('')
  const [taskLocation, setTaskLocation] = useState('')
  const [hiring, setHiring] = useState(false)

  useEffect(() => {
    loadWorker()
  }, [params.id])

  async function loadWorker() {
    try {
      const res = await fetch(`/api/workers/${params.id}`)
      const data = await res.json()
      setWorker(data)
    } catch (err) {
      console.error('Failed to load worker:', err)
    }
    setLoading(false)
  }

  async function handleHire() {
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    if (!taskTitle.trim() || !taskDescription.trim() || !taskLocation.trim()) {
      alert(t('hire.fillAllFields') || 'Please fill in all required fields')
      return
    }

    const price = parseFloat(taskPrice)
    if (isNaN(price) || price <= 0) {
      alert(t('hire.invalidPrice') || 'Please enter a valid price')
      return
    }

    setHiring(true)
    try {
      const res = await fetch('/api/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: params.id,
          title: taskTitle,
          description: taskDescription,
          price: price,
          location: taskLocation
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert(t('hire.success') || 'Hire request sent successfully! The worker has been notified.')
        setShowHireModal(false)
        router.push(`/${locale}/tasks`)
      } else {
        alert(data.error || (t('hire.error') || 'Failed to send hire request'))
      }
    } catch (err) {
      console.error('Hire error:', err)
      alert(t('hire.error') || 'Failed to send hire request')
    }
    setHiring(false)
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        {t('common.loading') || 'Loading...'}
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <h2>{t('hire.workerNotFound') || 'Worker not found'}</h2>
        <Link href={`/${locale}/hire`} className="btn" style={{ marginTop: 16 }}>
          {t('hire.backToList') || 'Back to Workers'}
        </Link>
      </div>
    )
  }

  // Prevent users from hiring themselves
  if (session?.user && (session.user as any).id === worker.id) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{
          padding: 40,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          maxWidth: 500,
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚫</div>
          <h2>{t('hire.cannotHireSelf') || 'You cannot hire yourself'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>
            {t('hire.cannotHireSelfDescription') || 'You are viewing your own profile. You can only hire other workers.'}
          </p>
          <Link href={`/${locale}/hire`} className="btn" style={{ marginTop: 24, display: 'inline-block' }}>
            {t('hire.backToList') || 'Back to Workers'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/${locale}/hire`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          ← {t('hire.backToList') || 'Back to Workers'}
        </Link>
      </div>

      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 32
      }}>
        {/* Worker Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {worker.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>{worker.name || 'Anonymous'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {worker.averageRating > 0 ? (
                <>
                  <span style={{ color: '#f59e0b', fontSize: '1.5rem' }}>★</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    {worker.averageRating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    ({worker.reviewCount} {worker.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  No reviews yet
                </span>
              )}
            </div>
            {worker.profile?.location && (
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                📍 {worker.profile.location}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => {
                  if (!session) {
                    router.push(`/${locale}/login`)
                  } else {
                    setShowHireModal(true)
                  }
                }}
                className="btn"
                style={{ fontSize: '1.1rem', padding: '12px 32px' }}
              >
                {t('hire.hireButton') || 'Hire'}
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        {worker.profile?.bio && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>{t('hire.about') || 'About'}</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {worker.profile.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {worker.profile?.skills && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>{t('hire.skills') || 'Skills'}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {worker.profile.skills.split(',').map((skill: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.95rem'
                  }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Average Rating
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              {worker.averageRating > 0 ? (
                <>
                  <span style={{ color: '#f59e0b' }}>★</span>
                  {worker.averageRating.toFixed(1)}
                </>
              ) : (
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }} onClick={() => setShowHireModal(false)}>
          <div style={{
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            padding: 32,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>
              {t('hire.createTaskFor') || 'Create Task for'} {worker.name}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {t('create.taskTitle') || 'Task Title'} *
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={t('hire.titlePlaceholder') || 'e.g., Fix plumbing issue'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {t('create.description') || 'Description'} *
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder={t('hire.descriptionPlaceholder') || 'Describe the task in detail...'}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {t('create.price') || 'Price'} (MDL) *
              </label>
              <input
                type="number"
                value={taskPrice}
                onChange={(e) => setTaskPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {t('create.location') || 'Location'} *
              </label>
              <input
                type="text"
                value={taskLocation}
                onChange={(e) => setTaskLocation(e.target.value)}
                placeholder={t('hire.locationPlaceholder') || 'e.g., Chișinău'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleHire}
                disabled={hiring}
                className="btn"
                style={{ flex: 1 }}
              >
                {hiring ? (t('common.sending') || 'Sending...') : (t('hire.sendRequest') || 'Send Hire Request')}
              </button>
              <button
                onClick={() => setShowHireModal(false)}
                className="btn btn-secondary"
                disabled={hiring}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
