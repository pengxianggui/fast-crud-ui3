# 列组件

列组件泛指FastCrud提供的一系列列组件，这些不同的列组件有相同的支持属性和插槽。

## 公共属性

这些列组件有一些通用的prop配置项：

| 属性               | 说明                                                     | 类型                                                                     | 默认值     |
|------------------|--------------------------------------------------------|------------------------------------------------------------------------|---------|
| **prop**         | 同Element                                               | `String`                                                               | -       |
| **label**        | 同Element                                               | `String`                                                               | -       |
| filter           | 此项是否支持过滤查询                                             | `Boolean`                                                              | `true`  |
| firstFilter      | 在简筛、快筛中是否排第一个                                          | `Boolean`                                                              | `false` |
| quickFilterBlock | 对应的快筛项是否作为块级元素独占一行(针对一些checkbox group很常见，实现类似tab的交互效果) | `Boolean`                                                              | `false` |
| editable         | 此列是否可编辑(针对`FastTableColumn`无效)                         | `Boolean`/`Function<({row, editRow, config, status, col}) => Boolean>` | `true`  |
| required         | 编辑状态时此列是否必填                                            | `Boolean`                                                              | `false` |
| rules            | 编辑状态时针对此项的表单验证(同Element ElFormItem)                    | `Array`                                                                | `[]`    |

:::tip

1. 除了`prop`、`label`外，其它`el-table-column`支持的属性仍然完全支持
2. 依然可以在`<fast-table>`标签里使用`<el-table-column`,
   只是注意scope中的row不再是element原本的数据行，而是一个[FatRow](/latest/advance/fat-row)
   :::

## 公共插槽

| 插槽名     | 说明             | 类型                                              |
|---------|----------------|-------------------------------------------------|
| default | 内容单元格          | `{row: Object, column: Object, $index: Number}` |
| header  | 标题单元格，同Element | // 同Element                                     |

此外, 除了`FastTableColumn`外，其它`FastTableColumn*`均支持额外的两个插槽:

| 插槽名    | 说明          | 类型                                              |
|--------|-------------|-------------------------------------------------|
| normal | 非编辑状态时单元格内容 | `{row: Object, column: Object, $index: Number}` |
| edit   | 编辑状态时的单元格内容 | `{row: Object, column: Object, $index: Number}` |

:::warning

1. 上述插槽中提供参数中的row不再和Element一样是一个业务数据记录行, 而是一个[fatRow](/latest/advance/fat-row)
   ，下文中其它列组建插槽内涉及的row均为fatRow，不再额外赘述。
2. `default`插槽自定义后, `normal`和`edit`失效。
   :::

## FastTableColumn

`FastTableColumn`是FastCrud提供的一个不支持行内编辑的列组件，通常针对`id`、`createTime`这种字段使用。

## FastTableColumnInput

用于字符输入项。`prop`支持参考`ElInput`。

### 事件

| 事件名    | 说明                     | 类型                                                 |
|--------|------------------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时          | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时           | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时             | `Function<(event, {row, column, $index}) => void>` |
| input  | 在 Input 值改变时触发         | `Function<(val, {row, column, $index}) => void>`   |
| clear  | 点击由clearable属性生成的清空按钮时 | `Function<({row, column, $index}) => void>`        |

## FastTableColumnNumber

用于数值输入项。`prop`支持参考`ElNumber`。

### 事件

| 事件名    | 说明            | 类型                                                 |
|--------|---------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时 | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时  | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时    | `Function<(event, {row, column, $index}) => void>` |

## FastTableColumnSelect

用于下拉选项。`prop`支持参考[`FastSelect`](/latest/comp/fast-select)。此外还支持:

### 属性

| 属性                  | 说明                       | 类型        | 默认值   |
|---------------------|--------------------------|-----------|-------|
| quickFilterCheckbox | 快筛时是否转换为checkbox group呈现 | `Boolean` | false |

### 事件

| 事件名            | 说明                     | 类型                                                   |
|----------------|------------------------|------------------------------------------------------|
| change         | 行内编辑时控件值发生变更时          | `Function<(val, {row, column, $index}) => void>`     |
| focus          | 行内编辑时控件获得焦点时           | `Function<(event, {row, column, $index}) => void>`   |
| blur           | 行内编辑时控件失焦时             | `Function<(event, {row, column, $index}) => void>`   |
| clear          | 点击由clearable属性生成的清空按钮时 | `Function<({row, column, $index}) => void>`          |
| visible-change | 下拉框出现/隐藏时触发            | `Function<(visible, {row, column, $index}) => void>` |
| remove-tag     | 多选模式下移除tag时触发          | `Function<(tagVal, {row, column, $index}) => void>`  |

## FastTableColumnSwitch

用于switch切换，适用于有两个对立值的情况。`prop`参考`ElSwitch`.
> 作为查询控件, 会表现为`Select`

### 事件

| 事件名    | 说明            | 类型                                               |
|--------|---------------|--------------------------------------------------|
| change | 行内编辑时控件值发生变更时 | `Function<(val, {row, column, $index}) => void>` |

## FastTableColumnTextArea

多行文本输入项。`prop`参考`ElInput`

### 事件

| 事件名    | 说明                     | 类型                                                 |
|--------|------------------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时          | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时           | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时             | `Function<(event, {row, column, $index}) => void>` |
| input  | 在 Input 值改变时触发         | `Function<(val, {row, column, $index}) => void>`   |
| clear  | 点击由clearable属性生成的清空按钮时 | `Function<({row, column, $index}) => void>`        |

## FastTableColumnImg

图片上传。`prop`参考`FastUpload`
> 设置`list-type` 无效

### 属性

| 属性               | 说明                              | 类型                                                                   | 默认值 |
|------------------|---------------------------------|----------------------------------------------------------------------|-----|
| on-preview       | 预览时                             | `Function<(file, {row, column, $index}) => void>`                    | -   |
| before-remove    | 移除前                             | `Function<(file, files, {row, column, $index}) => void>`             | -   |
| on-remove        | 移除前                             | `Function<(file, files, {row, column, $index}) => void>`             | -   |
| response-handler | 上传成功后、组件接收前对数据二次处理              | `Function<(response, file, files, {row, column, $index}) => String>` | -   |
| on-success       | 上传成功后, 组件处理完毕后                  | `Function<(response, file, files, {row, column, $index}) => void>`   | -   |
| on-progress      | 上传时                             | `Function<(event, file, files, {row, column, $index}) => void>`      | -   |
| on-change        | 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 | `Function<(event, file, files, {row, column, $index}) => void>`      | -   |
| on-exceed        | 当超出限制时，执行的钩子函数                  | `Function<(file, files, {row, column, $index}) => void>`             | -   |

## FastTableColumnFile

文件上传。`prop`参考`FastUpload`
> 设置`list-type` 无效

### 属性

| 属性               | 说明                              | 类型                                                                   | 默认值 |
|------------------|---------------------------------|----------------------------------------------------------------------|-----|
| on-preview       | 预览时                             | `Function<(file, {row, column, $index}) => void>`                    | -   |
| before-remove    | 移除前                             | `Function<(file, files, {row, column, $index}) => void>`             | -   |
| on-remove        | 移除前                             | `Function<(file, files, {row, column, $index}) => void>`             | -   |
| response-handler | 上传成功后、组件接收前对数据二次处理              | `Function<(response, file, files, {row, column, $index}) => String>` | -   |
| on-success       | 上传成功后, 组件处理完毕后                  | `Function<(response, file, files, {row, column, $index}) => void>`   | -   |
| on-progress      | 上传时                             | `Function<(event, file, files, {row, column, $index}) => void>`      | -   |
| on-change        | 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 | `Function<(event, file, files, {row, column, $index}) => void>`      | -   |
| on-exceed        | 当超出限制时，执行的钩子函数                  | `Function<(file, files, {row, column, $index}) => void>`             | -   |

## FastTableColumnDatePicker

日期选择。`prop`参考`ElDatePicker`

### 事件

| 事件名    | 说明            | 类型                                                 |
|--------|---------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时 | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时  | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时    | `Function<(event, {row, column, $index}) => void>` |

## FastTableColumnTimePicker

时间选择。`prop`参考`ElTimePicker`

### 事件

| 事件名    | 说明            | 类型                                                 |
|--------|---------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时 | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时  | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时    | `Function<(event, {row, column, $index}) => void>` |

## FastTableColumnObject

对象选择。这个是`FastCrud`提供的一个基于[`FastObjectPicker`](/latest/comp/fast-object-picker)
封装的列组件，非常实用, 可以弹出一个`FastTable`选择数据回填到底表中。

:::tip
`FastObjectPicker`基于`[pick](/latest/advance/pick)`方法, 点击了解更多。
:::

### 属性

| 属性              | 说明             | 类型                | 默认值 |
|-----------------|----------------|-------------------|-----|
| **tableOption** | 弹出表tableOption | `FastTableOption` | -   |

> 指定的`tableOption`的渲染模版只能通过其`render`声明。

### 事件

| 事件名    | 说明            | 类型                                                 |
|--------|---------------|----------------------------------------------------|
| change | 行内编辑时控件值发生变更时 | `Function<(val, {row, column, $index}) => void>`   |
| focus  | 行内编辑时控件获得焦点时  | `Function<(event, {row, column, $index}) => void>` |
| blur   | 行内编辑时控件失焦时    | `Function<(event, {row, column, $index}) => void>` |
