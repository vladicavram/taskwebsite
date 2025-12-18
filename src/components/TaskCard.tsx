'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../lib/locale'

type Props = {
  id: string
  title: string
  description: string
  price?: number | null
  category?: string
  imageUrl?: string | null
}

export default function TaskCard({ id, title, description, price, category, imageUrl }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const { t } = useLocale()

  function handleViewDetails(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault()
      router.push(`/${locale}/login`)
    }
  }

  return (
    <Link
      href={`/${locale}/tasks/${id}`}
      onClick={handleViewDetails}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <article 
        className="card" 
        style={{ 
          padding: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--shadow)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          {category && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--accent)',
              background: 'var(--accent-light)',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {category}
            </span>
          )}
          {price && (
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--accent)'
            }}>
              {price} MDL
            </span>
          )}
        </div>
        
        <h3 style={{ 
          fontWeight: 600, 
          fontSize: '1rem', 
          marginBottom: '8px',
          color: 'var(--text)',
          lineHeight: '1.4'
        }}>
          {title}
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          fontSize: '0.875rem'
        }}>
          {description.length > 80 ? description.substring(0, 80) + '...' : description}
        </p>
      </article>
    </Link>
  )
}
