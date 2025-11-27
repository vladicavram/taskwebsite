import { NextIntlClientProvider } from 'next-intl'
import messagesEn from '../../messages/en.json'
import messagesRo from '../../messages/ro.json'
import messagesRu from '../../messages/ru.json'

export const messages = {
  en: messagesEn,
  ro: messagesRo,
  ru: messagesRu
}

export default NextIntlClientProvider
