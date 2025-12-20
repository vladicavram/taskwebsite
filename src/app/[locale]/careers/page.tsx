'use client'
import { useParams } from 'next/navigation'
import useLocale from '../../../lib/locale'

export default function CareersPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useLocale()

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>💼</div>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)' }}>
          {t('careers.title')}
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          {t('careers.subtitle')}
        </p>

        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '32px', 
          borderRadius: '12px',
          marginBottom: '32px',
          border: '2px dashed var(--border)'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text)' }}>
            {t('careers.notHiring')}
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            {t('careers.description')}
          </p>
        </div>

        <p style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 500 }}>
          {t('careers.stayConnected')}
        </p>
      </div>
    </div>
  )
}
