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
      {/* Hero Banner */}
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            {t('signup.title') || 'Join Our Platform'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('signup.subtitle') || 'How would you like to use our platform?'}
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
              width: '48px', 
              height: '48px', 
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.1
            }} />
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              {t('signup.tasker.title') || 'Become a Tasker'}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {t('signup.tasker.description') || 'Offer your services, find work, and earn money by completing tasks for clients.'}
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>{t('signup.tasker.feature1') || 'Browse and apply to tasks'}</li>
              <li>{t('signup.tasker.feature2') || 'Build your reputation with reviews'}</li>
              <li>{t('signup.tasker.feature3') || 'Set your own rates'}</li>
              <li>{t('signup.tasker.feature4') || 'Get verified with ID'}</li>
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
              width: '48px', 
              height: '48px', 
              margin: '0 auto 16px',
              borderRadius: '8px',
              background: 'var(--accent)',
              opacity: 0.1
            }} />
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              {t('signup.poster.title') || 'Post Tasks Only'}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {t('signup.poster.description') || 'Hire skilled taskers to help with your projects. Quick and simple signup.'}
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>{t('signup.poster.feature1') || 'Post tasks quickly'}</li>
              <li>{t('signup.poster.feature2') || 'Hire verified taskers'}</li>
              <li>{t('signup.poster.feature3') || 'Simple registration (no ID required)'}</li>
              <li>{t('signup.poster.feature4') || 'Upgrade to tasker later'}</li>
            </ul>
          </button>

          {/* Option 3: Both */}
          <button
            onClick={() => handleSelection('both')}
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
              width: '48px', 
              height: '48px', 
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: 'var(--accent)',
              opacity: 0.15
            }} />
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              {t('signup.both.title') || 'Both - Full Access'}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {t('signup.both.description') || 'Get complete access - post tasks and offer your services as a tasker.'}
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>{t('signup.both.feature1') || 'Post tasks and apply to tasks'}</li>
              <li>{t('signup.both.feature2') || 'Maximum flexibility'}</li>
              <li>{t('signup.both.feature3') || 'Full platform access'}</li>
              <li>{t('signup.both.feature4') || 'ID verification required'}</li>
            </ul>
          </button>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem'
        }}>
          {t('signup.hasAccount') || 'Already have an account?'}{' '}
          <a 
            href={`/${locale}/login`}
            style={{ color: 'var(--accent)', fontWeight: 600 }}
          >
            {t('auth.login') || 'Sign In'}
          </a>
        </div>
      </div>
    </div>
  )
}
