import { createI18n } from 'vue-i18n'
import zhCn from './lang/zh-cn'
import en from './lang/en'

const messages = {
  'zh-CN': zhCn,
  'en': en
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

export function configureI18n(options) {
  if (options.locale) {
    i18n.global.locale.value = options.locale
  }
  if (options.fallbackLocale) {
    i18n.global.fallbackLocale = options.fallbackLocale
  }
  if (options.messages) {
    for (const lang in options.messages) {
      i18n.global.mergeLocaleMessage(lang, options.messages[lang])
    }
  }
}

export default i18n

export function useFastCrudI18n() {
  return i18n
}

export function setLanguage(lang) {
  i18n.global.locale.value = lang
}

export function getLanguage() {
  return i18n.global.locale.value
}

export function t(key, options = {}) {
  return i18n.global.t(key, options)
}

export function useI18n() {
  return { t }
}

export { messages as i18nMessages }
