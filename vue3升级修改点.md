#Vue升级不兼容点
参考: [vue3针对vue2的飞兼容改变](https://v3-migration.vuejs.org/zh/breaking-changes/)
## vue3生态组件推荐
- vite: 构建工具
- Pinia: 状态管理

## 本项目要注意的变更点
### 全局API
- [x] Vue.component、Vue.extend修改为使用createApp, props传参使用createApp第2个参数
- [x] 调整导出(element-ui改成element-plus)
- [x] this.$nextTick 替换为使用从vue中导出的nextTick

### 模版指令
- [x] 替换.sync, 使用v-model:{prop}=""
- [x] v-model= 的组件内部,value全部改成modelValue, 并调整emit使用方式
- [x] emit的自定义事件名推荐使用camelCase命名形式
- [x] 原生事件监听的.native语法糖被移除, 使用emits定义自定义事件

### 组件
- [x] 组件事件使用emits定义, 原生事件和自定义事件监听区别

### 渲染函数
- [x] render函数中的h需要显式从vue中import出来
- [x] 对于渲染自定义组件，不能直接提供组件名实现渲染目的，必须使用resolveComponent函数来实现。
- [ ] $attrs 包含 class & style, 也就是说class和style也会被视作attr的一部分，被子组件的v-bind="$attrs"绑定到子组件中指定位置(而非根标签), 检查对样式的影响。

### 其它小改变
- [x] beforeDestroy生命周期被重命名为beforeUnmount
- [x] props中使用default函数形式时, 无法使用this变量，其入参含义发生改变
- [x] watch数组时, 元素变更想要触发，必须显式声明deep:true
- [x] 过滤器filter不再支持, 使用computed计算属性替代
- [ ] $destroy被移除，替代？

# ElementPlus升级不兼容点
参考[Element Plus 不兼容变化（中文简体）](https://github.com/element-plus/element-plus/discussions/5657)
- [x] Font Icon被移除，所有"el-icon-*"使用方式都要替换为导出字体组件
- [x] 组件size体系变更，只有:  large / default / small 三个选择。
- [x] layout布局组件删除type
- [x] dialog组件删除visible属性，改为v-model
- [x] DatePicker / Time Picker / DateTime Picker 部分属性删除，部分属性更名
- [x] Form表单 validate校验失败时，返回一个reject的Promise，不再是false
- [x] 单独使用Message消息框时，得使用ElMessage
