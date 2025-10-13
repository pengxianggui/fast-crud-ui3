# fast-crud-ui3

<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">FastCrudUi3</h1>
<h4 align="center">基于Vue/ElementPlus开发的表格快速开发工具, 快速实现功能强大的表格维护页面</h4>
<p align="center">
	<a href="http://fastcrud-doc.pengxg.cc/">文档</a> |
	<a href="http://fastcrud.pengxg.cc/">演示环境</a> |
	<a href="https://github.com/pengxianggui/fast-crud">配套后端</a> |
	<a href="https://github.com/pengxianggui/fast-crud-ui3/releases">ChangeLog</a> |
	<a href="https://github.com/pengxianggui/fast-crud-ui3/blob/main/LICENSE">LICENSE</a>
</p>

> 1. 此项目为[fast-crud-ui](https://github.com/pengxianggui/fast-crud-ui)的vue3升级支持版本。
> 2. 此项目必须配合[后端](https://github.com/pengxianggui/fast-crud)使用。

## 说明:

**fast-crud-ui3基于vue@^3.4.0 + element-plus@^2.3.12， fast-crud-ui3打包不会包含这两个组件，你必须在项目里单独安装并正确注册。**

如果针对element-plus你采用的是按需部分引入，请确保以下element-plus组件正确注册, 否则fast-crud-ui3中部分内容将无法正常展示：

Table, TableColumn, Input, InputNumber, Checkbox, CheckboxGroup, Select, Option, DatePicker, Switch, TimePicker, Radio,
Upload, Row, Col, Button, Empty, Popover, Form, FormItem, Dropdown, DropdownMenu, DropdownItem, Pagination, Link

> node=18.16.0
> npm=9.5.1

## 快速开始

安装

```bash
npm install fast-crud-ui3
```

配置

```js
import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import App from './App.vue'
import '@/assets/index.scss'
import '@/../packages/assets/fonts/iconfont.css'
import FastCrudUI from 'fast-crud-ui3'
import http from "@/http";
import router from '@/router'

const app = createApp(App)
app.use(ElementPlus, {
    // element-plus 配置项
})
app.use(FastCrudUI, {
    $http: http,
    $router: router,
    // fast-crud-ui3配置项
})
// 注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')
```

使用

```vue

<template>
  <fast-table :option="tableOption">
    <fast-table-column-img prop="avatarUrl" label="头像"/>
    <fast-table-column-input prop="name" label="姓名"/>
    <fast-table-column-number prop="age" label="年龄"/>
    <fast-table-column-select prop="sex" label="性别"
                              :options="[{label: '男', value: '1'}, {label: '女', value: '0'}]"/>
    <fast-table-column-date-picker prop="createTime" label="创建时间" type="datetime" :editable="false"/>
  </fast-table>
</template>

<script>
  import {FastTableOption} from "fast-crud-ui3";

  export default {
    name: "EasyDemo",
    data() {
      return {
        tableOption: new FastTableOption({
          module: 'student',
          // 更多配置参考文档或者完整示例(./src/example/full/FullDemo.vue)
        })
      }
    }
  }
</script>
```
