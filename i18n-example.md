# Fast-CRUD-UI3 国际化使用指南

## 概述

Fast-CRUD-UI3 已经集成了基于 vue-i18n 的国际化功能，支持中英文两种语言的切换。

## 安装

```bash
npm install fast-crud-ui3 vue-i18n@next
```

## 使用

### 1. 引入组件库并配置

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import 'element-plus/theme-chalk/index.css'
import App from './App.vue'
import FastCrudUI from 'fast-crud-ui3'
import 'fast-crud-ui3/lib/style.css'

const app = createApp(App)

// 配置 Element Plus 国际化
app.use(ElementPlus, {
  locale: en // 默认英文
})

// 注册 Fast-CRUD-UI3 并配置默认语言
app.use(FastCrudUI, {
  i18n: {
    locale: 'en-us', // 设置默认语言为英文
    fallbackLocale: 'zh-cn' // 设置回退语言为中文
  }
})

app.mount('#app')
```

### 2. 切换语言

```javascript
<template>
  <div>
    <el-button @click="switchLanguage('zh-cn')">中文</el-button>
    <el-button @click="switchLanguage('en-us')">English</el-button>
    
    <!-- 其他组件内容 -->
    <fast-table :option="tableOption">
      <!-- 表格列配置 -->
    </fast-table>
  </div>
</template>

<script setup>
import { setLanguage } from 'fast-crud-ui3'

// 切换语言函数
const switchLanguage = (lang) => {
  // 切换 Fast-CRUD-UI3 的语言
  setLanguage(lang)
  
  // 同时切换 Element Plus 的语言
  const ElementPlus = await import('element-plus/es')
  ElementPlus.use(app, {
    locale: lang === 'zh-cn' ? await import('element-plus/es/locale/lang/zh-cn') : await import('element-plus/es/locale/lang/en')
  })
}
</script>
```

### 3. 自定义语言

如果需要扩展或修改现有的语言包，可以通过以下方式：

```javascript
import { useFastCrudI18n } from 'fast-crud-ui3'

const i18n = useFastCrudI18n()

// 添加自定义翻译
const customMessages = {
  'zh-cn': {
    crud: {
      // 自定义中文翻译
      save: '保存数据'
    }
  },
  'en-us': {
    crud: {
      // 自定义英文翻译
      save: 'Save Data'
    }
  }
}

// 合并自定义翻译到现有语言包
for (const lang in customMessages) {
  i18n.global.mergeLocaleMessage(lang, customMessages[lang])
}
```

## 支持的语言

- 中文 (zh-cn)
- 英文 (en-us)

## 已国际化的组件

- Table 组件（按钮、提示、对话框等）
- 筛选组件（快速筛选、高级筛选、存筛等）
- 表单组件（保存、取消按钮等）
- 导出组件（导出对话框等）

## API 说明

### 安装配置选项

在安装组件库时，可以通过 `i18n` 选项配置国际化：

```javascript
app.use(FastCrudUI, {
  i18n: {
    locale: 'zh-cn', // 设置默认语言
    fallbackLocale: 'en-us', // 设置回退语言
    messages: {
      // 自定义翻译
      'zh-cn': {
        crud: {
          save: '保存数据'
        }
      }
    }
  }
})
```

### `configureI18n(options)`

动态配置国际化选项。

- `options`: 配置对象
  - `locale`: 语言代码，可选值为 'zh-cn' 或 'en-us'
  - `fallbackLocale`: 回退语言代码
  - `messages`: 自定义翻译消息对象

### `setLanguage(lang)`

切换组件库的语言。

- `lang`: 语言代码，可选值为 'zh-cn' 或 'en-us'

### `getLanguage()`

获取当前使用的语言。

### `useFastCrudI18n()`

获取 vue-i18n 实例，用于自定义语言或扩展翻译。

## 注意事项

1. 确保项目中已经安装了 `vue-i18n@next`
2. 语言切换会影响所有使用了国际化文本的组件
3. 自定义语言时，需要按照现有语言包的结构进行扩展
