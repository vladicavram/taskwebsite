"use client"
import { useRouter, usePathname } from 'next/navigation'

const locales = [
  { code: 'en', label: 'ENG' },
  { code: 'ro', label: 'RO' },
  { code: 'ru', label: 'RU' }
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

  const switchLocale = (newLocale: string) => {
    if (pathname) {
      const segments = pathname.split('/')
      segments[1] = newLocale
      router.push(segments.join('/'))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={currentLocale}
        onChange={(e) => switchLocale(e.target.value)}
        style={{
          padding: '8px 28px 8px 12px',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center'
        }}
      >
        {locales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </div>
  )
}
