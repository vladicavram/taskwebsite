'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../lib/locale'

export default function BookTaskButton() {
  const { locale, t } = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleClick = () => {
    // Always navigate to the public tasks browser. Viewing task details still requires login.
    router.push(`/${locale}/tasks`)
  }

  return (
    <button 
      onClick={handleClick}
      className="btn btn-secondary" 
      style={{ 
        fontSize: '1.1rem',
        padding: '16px 40px',
        fontWeight: 600,
        minWidth: '220px'
      }}
    >
      {t('home.browseBtn') || 'Book a Task'}
    </button>
  )
}
