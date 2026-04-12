import { createI18n } from 'vue-i18n'
import zhCN from './lang/zh-cn'
import en from './lang/en'

const messages = {
  'zh-cn': zhCN,
  'en': en
}

// 创建 i18n 实例，但不立即设置 locale
const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn', // 默认值，后续可通过配置修改
  fallbackLocale: 'zh-cn',
  messages
})

// 导出配置函数，用于设置默认语言
export function configureI18n(options) {
  if (options.locale) {
    i18n.global.locale.value = options.locale
  }
  if (options.fallbackLocale) {
    i18n.global.fallbackLocale = options.fallbackLocale
  }
  if (options.messages) {
    // 合并自定义消息
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

// 导出翻译函数，供普通JavaScript类使用
export function t(key, options = {}) {
  return i18n.global.t(key, options)
}
