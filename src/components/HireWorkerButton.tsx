'use client'
import { useRouter } from 'next/navigation'
import useLocale from '../lib/locale'

export default function HireWorkerButton() {
  const { locale, t } = useLocale()
  const router = useRouter()

  const handleClick = () => {
    router.push(`/${locale}/hire`)
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
      {t('home.hireBtn') || 'Hire a Worker'}
    </button>
  )
}
