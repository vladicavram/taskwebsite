'use client'
import { useParams } from 'next/navigation'
import useLocale from '../../../lib/locale'

export default function CommunityGuidelinesPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useLocale()

  const guidelines = [
    { title: 'guidelines.respect.title', content: 'guidelines.respect.content', icon: '🤝' },
    { title: 'guidelines.honesty.title', content: 'guidelines.honesty.content', icon: '✨' },
    { title: 'guidelines.safety.title', content: 'guidelines.safety.content', icon: '🛡️' },
    { title: 'guidelines.quality.title', content: 'guidelines.quality.content', icon: '⭐' },
    { title: 'guidelines.communication.title', content: 'guidelines.communication.content', icon: '💬' },
    { title: 'guidelines.prohibited.title', content: 'guidelines.prohibited.content', icon: '🚫' },
    { title: 'guidelines.consequences.title', content: 'guidelines.consequences.content', icon: '⚖️' }
  ]

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)', textAlign: 'center' }}>
          {t('guidelines.title')}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>
          {t('guidelines.subtitle')}
        </p>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '40px',
          border: '2px solid var(--accent)'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text)' }}>
            {t('guidelines.intro')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          {guidelines.map((guideline, index) => (
            <div 
              key={index}
              style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 style={{ 
                fontSize: '1.4rem', 
                marginBottom: '12px', 
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2rem' }}>{guideline.icon}</span>
                {t(guideline.title)}
              </h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                {t(guideline.content)}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          padding: '32px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'white' }}>
            ⚠️ {t('guidelines.reporting')}
          </p>
        </div>
      </div>
    </div>
  )
}
