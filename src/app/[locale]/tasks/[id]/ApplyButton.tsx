"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../../../../lib/locale'

export default function ApplyButton({ 
  taskId, 
  locale,
  taskPrice,
  taskTitle,
  taskCreatorName,
  hasAlreadyApplied = false
}: { 
  taskId: string
  locale: string
  taskPrice?: number | null
  taskTitle?: string
  taskCreatorName?: string
  hasAlreadyApplied?: boolean
}) {
  const { t } = useLocale()
  const { data: session } = useSession()
  const [proposedPrice, setProposedPrice] = useState(taskPrice?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState(0)
  const [canApply, setCanApply] = useState(true)
  const [applied, setApplied] = useState(hasAlreadyApplied)
  const [showContract, setShowContract] = useState(false)
  const [agree, setAgree] = useState(false)
  const agreeRef = useRef<HTMLInputElement>(null)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      fetchCredits()
    }
  }, [session])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/users/credits')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
        setCanApply(data.canApply !== false)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const interpolate = (template: string, vars: Record<string, string | number>): string => {
    return template.replace(/{{(\w+)}}/g, (_, key) => String(vars[key] ?? ''))
  }

  const calculateRequiredCredits = (price: number) => {
    // 1 credit = 100 MDL, fractional credits allowed
    return price / 100
  }

  const effectivePriceNumber = (() => {
    const n = proposedPrice ? parseFloat(proposedPrice) : (taskPrice || 0)
    return isNaN(n) ? 0 : n
  })()

  const buildAgreementText = (includeSignature: boolean) => {
    const amountStr = effectivePriceNumber.toFixed(2)
    const now = new Date()
    const nowIso = now.toISOString()
    const humanDate = now.toLocaleString()
    const applicantName = (session?.user?.name || session?.user?.email || 'Applicant') as string
    const creator = taskCreatorName || t('agreement.taskCreator') || 'Task Creator'
    const title = taskTitle || t('agreement.task') || 'Task'

    let text = `${t('agreement.title') || 'Application Agreement'}\n\n` +
      `${t('agreement.between') || 'Between'}:\n` +
      `- ${t('agreement.taskCreatorLabel') || 'Task Creator'}: ${creator}\n` +
      `- ${t('agreement.applicantLabel') || 'Applicant'}: ${applicantName}\n\n` +
      `${t('agreement.task') || 'Task'}: ${title}\n` +
      `${t('agreement.taskId') || 'Task ID'}: ${taskId}\n` +
      `${t('agreement.applicationDate') || 'Application Date'}: ${humanDate} (${nowIso})\n\n` +
      `${t('agreement.terms') || 'Terms'}:\n` +
      `1) ${t('agreement.term1') || `The Applicant agrees to perform the task for the posted amount of ${amountStr} MDL.`}\n` +
      `2) ${t('agreement.term2') || 'The Applicant is not obligated to perform the task if material circumstances arise that were not reasonably known at the time of applying (e.g., substantially different scope, unsafe conditions, or missing information).'}\n` +
      `3) ${t('agreement.term3') || 'This agreement is not an employment contract and does not create an employer-employee relationship.'}\n` +
      `4) ${t('agreement.term4') || 'Messaging within the platform should be used to clarify scope and logistics.'}\n` +
      `5) ${t('agreement.term5') || 'Either party may cancel before work begins if a mutual understanding cannot be reached.'}\n\n`

    if (includeSignature) {
      text += `${t('agreement.signatures') || 'Signatures'}:\n` +
        `${t('agreement.applicantLabel') || 'Applicant'}: ${applicantName}\n` +
        `${t('agreement.signedAt') || 'Signed At'}: ${humanDate} (${nowIso})\n`
    }

    return text
  }

  const startApply = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate credits before showing contract
    const requiredCredits = calculateRequiredCredits(effectivePriceNumber)
    if (requiredCredits > credits) {
      const reqStr = requiredCredits.toFixed(2)
      const requiredPlural = requiredCredits >= 2 ? 's' : ''
      const template = t('taskDetail.apply.insufficientCredits') || 'Insufficient credits. You need {{required}} credit{{requiredPlural}} but only have {{current}}. Purchase more credits to apply.'
      setError(interpolate(template, { required: reqStr, requiredPlural, current: String(credits) }))
      return
    }
    setShowContract(true)
  }

  useEffect(() => {
    if (showContract) {
      // focus the checkbox for faster interaction
      agreeRef.current?.focus()
    }
  }, [showContract])

  const confirmApply = async () => {
    if (!agree) {
      setError(t('agreement.mustAgree') || 'You must agree to the terms before proceeding')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          proposedPrice: effectivePriceNumber,
          agree: true,
          agreementText: buildAgreementText(true)
        })
      })

      if (response.ok) {
        setApplied(true)
        setShowContract(false)
        router.refresh()
      } else {
        let msg = 'Failed to submit application'
        try {
          const text = await response.text()
          try {
            const data = JSON.parse(text)
            msg = data.error || msg
          } catch {
            msg = text || msg
          }
        } catch {}
        setError(msg)
      }
    } catch (err) {
      setError(t('taskDetail.apply.errorAlert') || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = proposedPrice ? parseFloat(proposedPrice) : 0
  const requiredCredits = calculateRequiredCredits(currentPrice)
  const hasEnoughCredits = credits >= requiredCredits

  if (applied) {
    return (
      <div style={{
        padding: '12px 16px',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        color: 'var(--accent)',
        fontWeight: 600,
        marginTop: '8px'
      }}>
        {t('taskDetail.apply.alreadyApplied') || '✓ You have already applied for this task'}
      </div>
    )
  }

  if (!canApply) {
    return (
      <div style={{
        padding: '16px',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        color: '#92400e',
        marginTop: '8px'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          ⏳ {t('taskDetail.apply.pendingTitle') || 'Pending Approval'}
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          {t('taskDetail.apply.pendingBody') || 'Your account is being reviewed by our team. You will be able to apply for tasks once approved.'}
        </p>
      </div>
    )
  }

  return (
    <>
    <form onSubmit={startApply} style={{ marginTop: '8px' }}>
      {error && (
        <div style={{
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: 'var(--radius-sm)',
          color: '#c00',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: 600
        }}>
          {t('taskDetail.apply.yourOffer') || 'Your Offer:'}
          <input
            type="number"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder={t('taskDetail.apply.pricePlaceholder') || 'Price'}
            min="0"
            step="0.01"
            required
            style={{
              padding: '10px 12px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '16px',
              fontWeight: 600,
              width: '120px'
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>{t('taskDetail.apply.usd') || 'USD'}</span>
        </label>
        
        <button
          type="submit"
          disabled={loading || !hasEnoughCredits}
          className="btn"
          style={{
            padding: '10px 24px',
            opacity: (loading || !hasEnoughCredits) ? 0.6 : 1,
            cursor: (loading || !hasEnoughCredits) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (t('taskDetail.apply.applying') || 'Applying...') : (t('taskDetail.apply.applyNow') || 'Apply Now')}
        </button>
      </div>
      
      <div style={{ 
        fontSize: '0.875rem', 
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {taskPrice && (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {t('taskDetail.apply.originalPrice') || 'Original price:'} {taskPrice} MDL
          </p>
        )}
        {currentPrice > 0 && (
          <p style={{ 
            color: hasEnoughCredits ? 'var(--text-muted)' : 'var(--danger)', 
            margin: 0,
            fontWeight: hasEnoughCredits ? 400 : 600
          }}>
            {interpolate(t('taskDetail.apply.requiredCredits') || 'Required credits: {{credits}} (1 credit = 100 MDL)', { credits: requiredCredits.toFixed(2) })}
          </p>
        )}
        {session?.user && (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {interpolate(t('taskDetail.apply.yourBalance') || 'Your balance: {{credits}} credit{{plural}}', { credits: String(credits), plural: credits !== 1 ? 's' : '' })}
          </p>
        )}
      </div>
    </form>
    {showContract && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
      }}>
        <div className="card" style={{ maxWidth: 600, width: '90%', padding: 20, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>{t('agreement.title') || 'Agreement'}</h3>
          {error && (
            <div style={{
              padding: '12px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-sm)',
              color: '#c00',
              marginBottom: '12px'
            }}>
              {error}
            </div>
          )}
          <div style={{ maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap', border: '1px solid var(--border-light)', padding: 12, borderRadius: 6, marginBottom: 12 }}>
            {buildAgreementText(agree)}
          </div>
          <label htmlFor="agreement-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
            <input 
              id="agreement-checkbox"
              type="checkbox" 
              checked={agree} 
              onChange={(e) => setAgree(e.target.checked)} 
              style={{ width: 20, height: 20 }}
              ref={agreeRef}
            />
            <span style={{ fontWeight: 600 }}>{t('agreement.agree') || 'I agree to the terms'}</span>
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowContract(false); setAgree(false) }}>
              {t('agreement.cancel') || 'Cancel'}
            </button>
            <button type="button" className={`btn${shake ? ' apply-shake' : ''}`} disabled={loading} onClick={confirmApply}>
              {loading ? (t('agreement.applying') || 'Applying...') : (t('agreement.apply') || 'Apply')}
            </button>
          </div>
          <style>{`
            @keyframes applyShake {
              0% { transform: translateX(0); }
              20% { transform: translateX(-4px); }
              40% { transform: translateX(4px); }
              60% { transform: translateX(-4px); }
              80% { transform: translateX(4px); }
              100% { transform: translateX(0); }
            }
            .apply-shake { animation: applyShake 0.6s ease; }
          `}</style>
        </div>
      </div>
    )}
    </>
  )
}
