import messagesEn from '../../messages/en.json'
import messagesRo from '../../messages/ro.json'
import messagesRu from '../../messages/ru.json'

export function getTranslation(locale: string, key: string) {
  const messages = locale === 'ro' ? messagesRo : locale === 'ru' ? messagesRu : messagesEn
  return (messages as any)[key] ?? key
}
