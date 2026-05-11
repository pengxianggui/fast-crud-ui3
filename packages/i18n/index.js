import { createI18n, useI18n as vueUseI18n } from 'vue-i18n'
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

let _appI18n = null

export function setAppI18n(instance) {
  _appI18n = instance
}

function getAppI18n() {
  return _appI18n || i18n
}

export function configureI18n(options) {
  const target = getAppI18n()
  if (options.locale) {
    target.global.locale.value = options.locale
  }
  if (options.fallbackLocale) {
    target.global.fallbackLocale = options.fallbackLocale
  }
  if (options.messages) {
    for (const lang in options.messages) {
      target.global.mergeLocaleMessage(lang, options.messages[lang])
    }
  }
}

export default i18n

export function useFastCrudI18n() {
  return getAppI18n()
}

export function setLanguage(lang) {
  getAppI18n().global.locale.value = lang
}

export function getLanguage() {
  return getAppI18n().global.locale.value
}

export function t(key, options = {}) {
  return getAppI18n().global.t(key, options)
}

export function useI18n() {
  return vueUseI18n()
}

export { messages as i18nMessages }
