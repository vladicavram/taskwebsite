'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useLocale from '../../../../lib/locale'
import { CURRENCY_SYMBOL } from '../../../../lib/constants'
import Chat from '../../../../components/Chat'

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
  locale,
  taskPrice
}: {
  applications: Applicant[]
  locale: string
  taskPrice?: number | null
}) {
  const { t } = useLocale()
  const [items, setItems] = useState(applications)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const acceptedApp = items.find((a) => a.status === 'accepted')
  const pendingApps = items.filter((a) => a.status === 'pending')
  const removedApps = items.filter((a) => a.status === 'removed')

  async function updateStatus(id: string, status: 'accepted' | 'declined' | 'removed') {
    const prev = [...items]
    // optimistic
    setItems((curr) => curr.map((a) => (a.id === id ? { ...a, status } : a)))

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
      alert(t('taskDetail.applicants.updateError') || 'Could not update application. Please try again.')
    }
  }

  async function removeApplicant(id: string) {
    if (!confirm(t('taskDetail.applicants.confirmRemove') || 'Are you sure you want to remove this applicant? They will be notified.')) {
      return
    }
    await updateStatus(id, 'removed')
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
      <h3 style={{ marginBottom: '16px' }}>{t('taskDetail.applicants.title') || 'Applicants'} ({items.filter(a => a.status !== 'removed').length})</h3>
      
      {/* Currently Accepted Applicant */}
      {acceptedApp && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: 'var(--accent)' }}>
            ✓ {t('taskDetail.applicants.selectedApplicant') || 'Selected Applicant'}
          </h4>
          <div
            style={{
              padding: '16px',
              background: '#d1fae5',
              border: '2px solid #10b981',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {acceptedApp.applicant.name || acceptedApp.applicant.email}
                </div>
                {acceptedApp.proposedPrice && taskPrice && acceptedApp.proposedPrice !== taskPrice && (
                  <div style={{ fontSize: '0.9rem', color: '#065f46' }}>
                    {t('taskDetail.applicants.agreedPrice') || 'Agreed price:'} {acceptedApp.proposedPrice} {CURRENCY_SYMBOL}
                  </div>
                )}
              </div>
              <button
                className="btn"
                style={{ 
                  background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                  borderColor: '#dc2626'
                }}
                disabled={isPending}
                onClick={() => removeApplicant(acceptedApp.id)}
              >
                {t('taskDetail.applicants.remove') || 'Remove'}
              </button>
            </div>
          </div>
          
          {/* Chat with accepted applicant */}
          <div style={{ marginTop: '16px' }}>
            <Chat 
              partnerId={acceptedApp.applicant.id}
            />
          </div>
        </div>
      )}
      
      {/* Pending Applicants */}
      {pendingApps.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {acceptedApp && (
            <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>
              {t('taskDetail.applicants.otherApplicants') || 'Other Applicants'}
            </h4>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApps.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {app.applicant.name || app.applicant.email}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {app.proposedPrice && (!taskPrice || app.proposedPrice !== taskPrice) 
                      ? `${t('taskDetail.applicants.proposed') || 'Proposed:'} ${app.proposedPrice} ${CURRENCY_SYMBOL}` 
                      : !app.proposedPrice && (t('taskDetail.applicants.noPrice') || 'No price proposed')}
                  </div>
                  {app.message && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      "{app.message}"
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn"
                    disabled={isPending || !!acceptedApp}
                    onClick={() => updateStatus(app.id, 'accepted')}
                  >
                    {t('taskDetail.applicants.select') || 'Select'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    disabled={isPending}
                    onClick={() => updateStatus(app.id, 'declined')}
                  >
                    {t('taskDetail.applicants.decline') || 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Removed Applicants (collapsible) */}
      {removedApps.length > 0 && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t('taskDetail.applicants.removedApplicants') || 'Removed Applicants'} ({removedApps.length})
          </summary>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {removedApps.map((app) => (
              <div
                key={app.id}
                style={{
                  padding: '8px 12px',
                  background: '#fee2e2',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  color: '#991b1b'
                }}
              >
                {app.applicant.name || app.applicant.email}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
