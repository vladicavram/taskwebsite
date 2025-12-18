"use client"
import { useRouter } from 'next/navigation'
import useLocale from '../../../lib/locale'

export default function SignUpOptionsPage() {
  const router = useRouter()
  const { locale, t } = useLocale()

  const handleSelection = (userType: string) => {
    router.push(`/${locale}/profile/register?type=${userType}`)
  }

  return (
    <div>
      {/* Free Credits Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #667eea 100%)',
        color: 'white',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {t('signup.banner')}
      </div>

      {/* Hero Banner */}
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            {t('signup.title')}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('signup.subtitle')}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1000px', marginBottom: '60px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Option 1: Become a Tasker */}
          <button
            onClick={() => handleSelection('tasker')}
            className="card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid var(--border)',
              background: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              margin: '0 auto 20px',
              borderRadius: '50%',
              border: '3px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              {t('signup.tasker.title')}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {t('signup.tasker.description')}
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>{t('signup.tasker.feature1')}</li>
              <li>{t('signup.tasker.feature2')}</li>
              <li>{t('signup.tasker.feature3')}</li>
              <li>{t('signup.tasker.feature4')}</li>
            </ul>
          </button>

          {/* Option 2: Post Tasks Only */}
          <button
            onClick={() => handleSelection('poster')}
            className="card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid var(--border)',
              background: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              margin: '0 auto 20px',
              borderRadius: '12px',
              border: '3px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              {t('signup.poster.title')}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {t('signup.poster.description')}
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>{t('signup.poster.feature1')}</li>
              <li>{t('signup.poster.feature2')}</li>
              <li>{t('signup.poster.feature3')}</li>
              <li>{t('signup.poster.feature4')}</li>
            </ul>
          </button>

        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem'
        }}>
          {t('signup.hasAccount')}{' '}
          <a 
            href={`/${locale}/login`}
            style={{ color: 'var(--accent)', fontWeight: 600 }}
          >
            {t('signup.signIn')}
          </a>
        </div>
      </div>
    </div>
  )
}
