# fast-crud-ui3

> [fast-crud-ui](https://github.com/pengxianggui/fast-crud-ui)的vue3升级支持版本
>
> 后端: [传送门](https://github.com/pengxianggui/fast-crud)

## 说明:

**fast-crud-ui3基于vue@^3.4.0 + element-plus@^2.3.12， fast-crud-ui3打包不会包含这两个组件，你必须在项目里单独安装并正确注册。
**

如果针对element-ui你采用的是按需部分引入，请确保以下element-ui组件正确注册, 否则fast-crud-ui中部分内容将无法正常展示：

Table, TableColumn, Input, InputNumber, Checkbox, CheckboxGroup, Select, Option, DatePicker, Switch, TimePicker, Radio,
Upload, Row, Col, Button, Empty, Popover, Form, FormItem, Dropdown, DropdownMenu, DropdownItem, Pagination, Link

> node=18.16.0
> npm=9.5.1

## 组件列表

- FastTable: 核心组件
- FastTableColumn: 只读列组件
- FastTableColumnInput: 文本输入框列组件
- FastTableColumnNumber: 数字输入框列组件
- FastTableColumnTextarea: 文本域输入框列组件
- FastTableColumnSelect: 下拉框列组件
- FastTableColumnSwitch: switch列组件
- FastTableColumnDatePicker: 日期选择列组件
- FastTableColumnTimePicker: 时间选择列组件
- FastTableColumnImg: 图片列组件
- FastTableColumnFile: 文件列组件
- FastTableColumnObject: 对象选择组件

> 你也可以直接使用原生的el-table-column，但是需要注意的是由于行数据被封装, 所以需要解构一下: {row, editRow},使用row来做单元格数据展示,
> 详见[文档](http://fastcrud-doc.pengxg.cc/latest/comp/fast-table-column.html#%E5%85%AC%E5%85%B1%E6%8F%92%E6%A7%BD)

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

更多使用文档参见: [这里](http://fastcrud-doc.pengxg.cc)。
