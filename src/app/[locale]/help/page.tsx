'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useLocale from '../../../lib/locale'

export default function HelpPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useLocale()

  const faqs = [
    { q: 'help.faq.howItWorks.q', a: 'help.faq.howItWorks.a' },
    { q: 'help.faq.credits.q', a: 'help.faq.credits.a' },
    { q: 'help.faq.becomeTasker.q', a: 'help.faq.becomeTasker.a' },
    { q: 'help.faq.verification.q', a: 'help.faq.verification.a' },
    { q: 'help.faq.payments.q', a: 'help.faq.payments.a' },
    { q: 'help.faq.safety.q', a: 'help.faq.safety.a' },
    { q: 'help.faq.disputes.q', a: 'help.faq.disputes.a' },
    { q: 'help.faq.reviews.q', a: 'help.faq.reviews.a' }
  ]

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)', textAlign: 'center' }}>
          {t('help.title')}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>
          {t('help.subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--text)' }}>
                <span className="icon-styled">◯</span> {t(faq.q)}
              </h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                {t(faq.a)}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '48px',
          padding: '32px',
          background: 'linear-gradient(135deg, var(--accent) 0%, #B8895F 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'white' }}>
            {t('help.stillNeedHelp')}
          </h2>
          <Link 
            href={`/${locale}/contact`}
            className="btn"
            style={{
              display: 'inline-block',
              background: 'white',
              color: 'var(--accent)',
              padding: '14px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {t('help.contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  )
}
