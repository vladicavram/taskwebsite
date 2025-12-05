'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTranslation } from '../lib/locale'

export default function Footer() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const t = (key: string) => getTranslation(locale, key)

  return (
    <footer style={{
      background: 'var(--text)',
      color: 'white',
      padding: '64px 24px 24px',
      marginTop: '80px'
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '48px'
        }}>
          {/* Discover */}
          <div>
            <h4 style={{ marginBottom: '20px', color: 'white', fontSize: '1rem' }}>{t('footer.discover') || 'Discover'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.browseTasks') || 'Browse Tasks'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.becomeTasker') || 'Become a Tasker'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.servicesByCity') || 'Services by City'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.allServices') || 'All Services'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.eliteTaskers') || 'Elite Taskers'}
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ marginBottom: '20px', color: 'white', fontSize: '1rem' }}>{t('footer.company') || 'Company'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.aboutUs') || 'About Us'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.careers') || 'Careers'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.press') || 'Press'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.blog') || 'Blog'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.partnerWithUs') || 'Partner with Us'}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ marginBottom: '20px', color: 'white', fontSize: '1rem' }}>{t('footer.support') || 'Support'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.helpCenter') || 'Help Center'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.safety') || 'Safety'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.contactUs') || 'Contact Us'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.communityGuidelines') || 'Community Guidelines'}
              </Link>
              <Link href={`/${locale}/tasks`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer.trustSafety') || 'Trust & Safety'}
              </Link>
            </div>
          </div>

          {/* Download App */}
          <div>
            <h4 style={{ marginBottom: '20px', color: 'white', fontSize: '1rem' }}>{t('footer.downloadApp') || 'Download our app'}</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '0.95rem' }}>
              {t('footer.tackleToDoList') || 'Tackle your to-do list wherever you are'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href="#" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  width: 'fit-content'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('footer.downloadOn') || 'Download on the'}</div>
                  <div style={{ fontWeight: 600 }}>App Store</div>
                </div>
              </a>
              <a 
                href="#" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  width: 'fit-content'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('footer.getItOn') || 'Get it on'}</div>
                  <div style={{ fontWeight: 600 }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '32px'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '0.95rem' }}>
            {t('footer.followUs') || "Follow us! We're friendly:"}
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok'].map((social) => (
              <a
                key={social}
                href="#"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
                title={social}
              >
                {social[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.6)'
        }}>
          <div>
            {t('footer.allRightsReserved') || '© 2025 Dozo. All rights reserved.'}
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {t('footer.terms') || 'Terms'}
            </Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {t('footer.privacy') || 'Privacy'}
            </Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {t('footer.legal') || 'Legal'}
            </Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {t('footer.doNotSell') || 'Do Not Sell My Info'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
