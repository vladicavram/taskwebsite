'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useLocale from '../../../lib/locale'

export default function TrustSafetyPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useLocale()

  const features = [
    { title: 'trustSafety.verification.title', content: 'trustSafety.verification.content', icon: '🆔' },
    { title: 'trustSafety.screening.title', content: 'trustSafety.screening.content', icon: '🔍' },
    { title: 'trustSafety.reviews.title', content: 'trustSafety.reviews.content', icon: '⭐' },
    { title: 'trustSafety.support.title', content: 'trustSafety.support.content', icon: '💬' },
    { title: 'trustSafety.secure.title', content: 'trustSafety.secure.content', icon: '🔒' }
  ]

  const safetyTips = [
    'trustSafety.tips.1',
    'trustSafety.tips.2',
    'trustSafety.tips.3',
    'trustSafety.tips.4',
    'trustSafety.tips.5',
    'trustSafety.tips.6'
  ]

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)' }}>
            {t('trustSafety.title')}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('trustSafety.subtitle')}
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 500 }}>
            {t('trustSafety.commitment')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <h3 style={{ 
                fontSize: '1.4rem', 
                marginBottom: '12px', 
                color: 'var(--accent)'
              }}>
                {t(feature.title)}
              </h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                {t(feature.content)}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, #B8895F 100%)',
          padding: '32px',
          borderRadius: '12px',
          marginBottom: '48px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: 'white', textAlign: 'center' }}>
            {t('trustSafety.tips.title')}
          </h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px' 
          }}>
            {safetyTips.map((tip, index) => (
              <li key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                fontSize: '1.05rem',
                lineHeight: '1.6'
              }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>✓</span>
                <span style={{ color: 'white' }}>{t(tip)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{
          padding: '32px',
          background: '#fff3cd',
          borderRadius: '12px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: '#856404' }}>
            {t('trustSafety.report')}
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#856404', marginBottom: '24px' }}>
            {t('trustSafety.reportDescription')}
          </p>
          <Link 
            href={`/${locale}/contact`}
            className="btn"
            style={{
              display: 'inline-block',
              background: '#ffc107',
              color: '#000',
              padding: '14px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {t('footer.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  )
}
