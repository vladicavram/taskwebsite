"use client"
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import messagesEn from '../../messages/en.json'
import messagesRo from '../../messages/ro.json'
import messagesRu from '../../messages/ru.json'

const locales = ['en', 'ro', 'ru']

export function detectLocale(pathname: string | null | undefined) {
  if (!pathname) return 'ro'
  const seg = pathname.split('/').filter(Boolean)[0]
  if (locales.includes(seg || '')) return seg
  return 'ro'
}

export default function useLocale() {
  const pathname = usePathname()
  const [locale, setLocale] = useState('ro')
  
  useEffect(() => {
    setLocale(detectLocale(pathname))
  }, [pathname])
  
  const messages = locale === 'ro' ? messagesRo : locale === 'ru' ? messagesRu : messagesEn

  function t(key: string) {
    return (messages as any)[key] ?? key
  }

  return { locale, t }
}

// Server-side translation helper
export function getTranslation(locale: string, key: string) {
  const messages = locale === 'ro' ? messagesRo : locale === 'ru' ? messagesRu : messagesEn
  return (messages as any)[key] ?? key
}

// Client component for translations in server components
export function LocaleProvider({ message, fallback }: { message: string, fallback: string }) {
  const { t } = useLocale()
  return <>{t(message) || fallback}</>
}
