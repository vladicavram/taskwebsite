'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../lib/locale'

type Applicant = {
  id: string
  status: string
  message?: string | null
  proposedPrice?: number | null
  agreementText?: string | null
  agreementAcceptedAt?: string | null
  applicant: {
    id: string
    name?: string | null
    email: string
  }
}

export default function ApplicantsList({
  applications,
  locale
}: {
  applications: Applicant[]
  locale: string
}) {
  const { t } = useLocale()
  const [items, setItems] = useState(applications)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const hasAccepted = items.some((a) => a.status === 'accepted')

  async function updateStatus(id: string, status: 'accepted' | 'declined') {
    const prev = [...items]
    // optimistic
    if (status === 'accepted') {
      setItems((curr) =>
        curr.map((a) =>
          a.id === id ? { ...a, status: 'accepted' } : { ...a, status: 'declined' }
        )
      )
    } else {
      setItems((curr) => curr.map((a) => (a.id === id ? { ...a, status: 'declined' } : a)))
    }

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed')
      startTransition(() => router.refresh())
    } catch (e) {
      setItems(prev)
      // eslint-disable-next-line no-alert
      alert(t('taskDetail.applicants.updateError') || 'Could not update application. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ color: 'var(--text-muted)' }}>{t('taskDetail.applicants.noApplicants') || 'No applicants yet'}</div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>{t('taskDetail.applicants.title') || 'Applicants'} ({items.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((app) => (
          <div
            key={app.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                {app.applicant.name || app.applicant.email}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {app.proposedPrice ? `${t('taskDetail.applicants.proposed') || 'Proposed:'} $${app.proposedPrice}` : (t('taskDetail.applicants.noPrice') || 'No price proposed')}
              </div>
              {app.message && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  "{app.message}"
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: '0.85rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: app.status === 'accepted' ? 'var(--accent)' : 'var(--text-muted)'
                  }}
                >
                  {app.status}
                </span>
                {app.agreementText && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>
                      {t('taskDetail.apply.contract.view') || 'View Agreement'}
                    </summary>
                    <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-light)', whiteSpace: 'pre-wrap' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>
                        {(t('taskDetail.apply.contract.agreedAt') || 'Agreed at') + ': '}{app.agreementAcceptedAt ? new Date(app.agreementAcceptedAt).toLocaleString() : ''}
                      </div>
                      {app.agreementText}
                    </div>
                  </details>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                disabled={isPending || app.status === 'accepted' || hasAccepted}
                onClick={() => updateStatus(app.id, 'accepted')}
              >
                {t('taskDetail.applicants.accept') || 'Accept'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={isPending || app.status === 'declined'}
                onClick={() => updateStatus(app.id, 'declined')}
              >
                {t('taskDetail.applicants.decline') || 'Decline'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
