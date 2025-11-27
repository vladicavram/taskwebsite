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
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1584622781867-8e7d62b87747?w=400&h=300&fit=crop',
]

export default function TaskCard({ id, title, description, price, category }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'
  const { t } = useLocale()
  const hash = (str: string) => {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
    return h
  }
  const idx = hash(id) % placeholderImages.length
  const randomImage = placeholderImages[idx]
  const imageCandidates = [
    `/uploads/tasks/${id}/cover.webp`,
    `/uploads/tasks/${id}/cover.png`,
    `/uploads/tasks/${id}/cover.jpg`
  ]
  let initialImage = imageCandidates[0]

  function handleViewDetails(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault()
      router.push(`/${locale}/login`)
    }
  }

  return (
    <article 
      className="card" 
      style={{ 
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <div style={{ 
        width: '100%', 
        height: '200px',
        background: `#f9fafb`,
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img 
          src={initialImage}
          alt={title}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: 0.9
          }}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            const current = img.src
            const nextIdx = imageCandidates.findIndex(c => current.endsWith(c)) + 1
            if (nextIdx > 0 && nextIdx < imageCandidates.length) {
              img.src = imageCandidates[nextIdx]
            } else {
              img.src = randomImage
            }
          }}
        />
        {price && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 600,
            color: 'var(--accent)',
            boxShadow: 'var(--shadow)'
          }}>
            ${price}
          </div>
        )}
      </div>
      
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {category && (
          <span style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            padding: '4px 12px',
            borderRadius: '12px',
            marginBottom: '12px',
            width: 'fit-content'
          }}>
            {category}
          </span>
        )}
        
        <h3 style={{ 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          marginBottom: '8px',
          color: 'var(--text)'
        }}>
          <Link
            href={`/${locale}/tasks/${id}`}
            className="task-link"
            style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
            onClick={handleViewDetails}
          >
            {title}
          </Link>
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          flex: 1,
          lineHeight: '1.6'
        }}>
          {description.length > 120 ? description.substring(0, 120) + '...' : description}
        </p>
        
        <Link 
          href={`/${locale}/tasks/${id}`}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '10px 16px'
          }}
          onClick={handleViewDetails}
        >
          {t('tasks.viewDetails') || 'View Details'}
        </Link>
      </div>
    </article>
  )
}
