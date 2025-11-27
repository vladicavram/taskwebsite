'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../lib/locale'

export default function PostTaskButton({ style, label }: { style?: React.CSSProperties, label?: string }) {
  const { locale, t } = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleClick = () => {
    if (session?.user) {
      // User is logged in, go to create task page
      router.push(`/${locale}/tasks/create`)
    } else {
      // User not logged in, redirect to login
      router.push(`/${locale}/login`)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className="btn btn-secondary" 
      style={style}
    >
      {label ?? t('home.postBtn') ?? 'Post a Task'}
    </button>
  )
}
