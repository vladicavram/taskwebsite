'use client'
import { useParams } from 'next/navigation'
import useLocale from '../../../lib/locale'

export default function AboutPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useLocale()

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)' }}>
          {t('about.title')}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          {t('about.subtitle')}
        </p>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text)' }}>
            {t('about.whatIs')}
          </h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            {t('about.description')}
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: 'var(--text)' }}>
            {t('about.howToNavigate')}
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--accent)' }}>
              {t('about.forClients')}
            </h3>
            <ul style={{ lineHeight: '2', fontSize: '1.05rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
              <li>{t('about.step1')}</li>
              <li>{t('about.step2')}</li>
              <li>{t('about.step3')}</li>
              <li>{t('about.step4')}</li>
            </ul>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--accent)' }}>
              {t('about.forTaskers')}
            </h3>
            <ul style={{ lineHeight: '2', fontSize: '1.05rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
              <li>{t('about.taskerStep1')}</li>
              <li>{t('about.taskerStep2')}</li>
              <li>{t('about.taskerStep3')}</li>
              <li>{t('about.taskerStep4')}</li>
            </ul>
          </div>
        </section>

        <section style={{ 
          background: 'var(--bg-secondary)', 
          padding: '24px', 
          borderRadius: '12px',
          border: '2px solid var(--accent)'
        }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--accent)' }}>
            {t('about.credits')}
          </h3>
          <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            {t('about.creditsDescription')}
          </p>
        </section>
      </div>
    </div>
  )
}
