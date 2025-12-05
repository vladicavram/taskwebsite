'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import useLocale from '../../../../../lib/locale'
import { Coins, ArrowUpCircle, ArrowDownCircle, CheckCircle } from 'lucide-react'

interface CreditTransaction {
  id: string
  amount: number
  type: 'purchase' | 'spent' | 'refund'
  description: string
  createdAt: string
  relatedTaskId?: string
}

export default function CreditHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale, t } = useLocale()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const successCredits = searchParams.get('credits')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
      return
    }
    
    // Check if returning from successful payment
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      // Clear the URL params after showing success
      setTimeout(() => {
        router.replace(`/${locale}/profile/credits/history`)
      }, 5000)
    }
    
    fetchCredits()
    fetchHistory()
  }, [status, locale])

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/users/credits')
      if (res.ok) {
        const data = await res.json()
        setBalance(data.credits || 0)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/payments/history')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'purchase' || type === 'refund') {
      return <ArrowUpCircle size={20} style={{ color: 'var(--success)' }} />
    }
    return <ArrowDownCircle size={20} style={{ color: 'var(--danger)' }} />
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <p>Loading transaction history...</p>
      </div>
    )
  }

  return (
    <div>
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={28} />
            {t('creditHistory.title') || 'Credit History'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('creditHistory.subtitle') || 'View all your credit transactions'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Success Message */}
        {showSuccess && (
          <div style={{
            background: 'var(--success-light)',
            border: '1px solid var(--success)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                {t('creditHistory.paymentSuccess') || 'Payment Successful!'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {successCredits 
                  ? `${successCredits} ${t('creditHistory.creditsAdded') || 'credits have been added to your account'}`
                  : (t('creditHistory.creditsProcessing') || 'Your credits will be added shortly')}
              </div>
            </div>
          </div>
        )}

        {/* Current Balance Card */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
            Current Balance
          </div>
          <div style={{ 
            fontSize: '3.5rem', 
            fontWeight: 700, 
            color: 'var(--accent)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Coins size={42} />
            {Number(balance).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            = 100 MDL task value per credit
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '8px' }}>No transactions yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Purchase credits to get started
            </p>
            <button
              onClick={() => router.push(`/${locale}/profile/credits/purchase`)}
              className="btn"
            >
              Purchase Credits
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              Transaction History
            </div>
            <div>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: (transaction.type === 'purchase' || transaction.type === 'refund') 
                      ? 'var(--success)' 
                      : 'var(--danger)',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    {(transaction.type === 'purchase' || transaction.type === 'refund') ? '+' : '-'}
                    {Number(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
