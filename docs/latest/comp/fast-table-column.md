# 列组件

列组件泛指FastCrud提供的一系列列组件，这些不同的列组件有相同的支持属性和插槽。

## 公共属性

这些列组件有一些通用的prop配置项：

| 属性                          | 说明                                                                                               | 类型                                                                     | 默认值     |
|-----------------------------|--------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|---------|
| **prop**                    | 同Element                                                                                         | `String`                                                               | -       |
| **label**                   | 同Element                                                                                         | `String`                                                               | -       |
| filter                      | 是否支持过滤查询(若为false, 简筛、快筛、动筛都将关闭)。`1.5.4+`支持Number类型, 值越小简筛排序越靠前                                   | `Boolean\| Number`                                                     | `true`  |
| quickFilter                 | 在filter非false的前提下, 是否支持快筛。`1.5.4+`支持Number类型, 值越小快筛排序越靠前                                         | `Boolean\|Number`                                                      | `false` |
| quickFilterBlock            | 对应的快筛项是否作为块级元素独占一行(针对一些checkbox group很常见，实现类似tab的交互效果)                                           | `Boolean`                                                              | `false` |
| quickFilterConfig(`1.5.9+`) | 配置快筛项的一些监听方法,可用于实现快筛项的级联。详见[quickFilterConfig](#quickfilterconfig)                               | `Object`                                                               | `-`     |
| dynamicFilter(`1.5.12+`)    | 在filter非false的前提下, 列是否动筛。                                                                        | `Boolean`                                                              | `false` |
| unique(`1.5.12+`)           | 行内编辑时校验此列值是否唯一(后端必须提供/exists标准接口)。                                                               | `Boolean`                                                              | `false` |
| ~~firstFilter~~             | 在简筛、快筛中是否排第一个。由于filter、quickFilter在`1.5.4+`支持Number类型指定排序, 此配置项将于`1.6.0`移除                       | `Boolean`                                                              | `false` |
| editable                    | 此列是否可编辑(针对`FastTableColumn`无效)                                                                   | `Boolean`/`Function<({row, editRow, config, status, col}) => Boolean>` | `true`  |
| hidden(`1.5.9+`)            | 此列是否可展示(若需要检索, 但无需展示时有用)                                                                         | `Boolean`                                                              | `true`  |
| link(`1.5.9+`)              | 此列单元格是否显示为链接(若为Boolean类型且为true则默认将单元格内容作为链接地址, 若为字符串类型且非空则将link值作为链接地址,支持路由名、路由地址和http绝对地址)      | `Boolean`/`String`                                                     | `false` |
| required                    | 编辑状态时此列是否必填                                                                                      | `Boolean`                                                              | `false` |
| showLength(`1.5.7+`)        | 设置一个长度值，当单元格显示字符长度超过此值且无法显示全时会省略并支持点击弹窗预览完整内容(支持json预览), 注意: `FastColumnImg`和`FastColumnFile`不支持 | `Number`                                                               | `-`     |
| rules                       | 编辑状态时针对此项的表单验证(同Element ElFormItem)                                                              | `Array`                                                                | `[]`    |

> link还支持插值表达式，例如 link="/user/page?id={id}", 则插值站位{id}将会替换为此行记录中真实的id值

### quickFilterConfig

| 属性                      | 说明           | 类型                                                        | 默认值 |
|-------------------------|--------------|-----------------------------------------------------------|-----|
| ~~onChange~~            | ~~监听快筛项值改变~~ | `Function<(val, formModel, filter, filtersMap) => void>`  | -   |
| onChange(`1.5.8+(新格式)`) | 监听快筛项值改变     | `Function<({val, model, filter, filters, refs}) => void>` | -   |
| ~~onClick~~             | 监听快筛项点击事件    | `Function<(formModel, filter, filtersMap) => void>`       | -   |
| onClick(`1.5.8+(新格式)`)  | 监听快筛项点击事件    | `Function<({model, filter, filters, refs}) => void>`      | -   |

:::warning
1. 无论是onChange还是onClick, 对formModel/model更改值没有意义, 只能针对filter(当前快筛控件)或filtersMap(全部快筛控件)中的val值更改才会有实际作用。
2. 为使用方便,filters和refs均为map结构, refs可以拿到控件对象，从而按需调用其内部方法
:::

:::tip

1. 除了`prop`、`label`外，其它`el-table-column`支持的属性仍然完全支持
2. 依然可以在`<fast-table>`标签里使用`<el-table-column>`,
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

| 属性                  | 说明                                                | 类型                               | 默认值     |
|---------------------|---------------------------------------------------|----------------------------------|---------|
| quickFilterCheckbox | 快筛时是否转换为checkbox group呈现                          | `Boolean`                        | false   |
| options             | 提供的下拉选项。可以是静态对象数组, 或者一个FastTableOption(`1.5.16+`) | `Array<Object>\|FastTableOption` | `[]`    |
| labelKey            | options中作为label的属性名                               | `String`                         | `label` |
| labelKey            | options中作为value的属性名                               | `String`                         | `value` |

> 对于options而言。在`1.5.16+`开始支持一个`FastTableOption`对象，内部将基于`FastTableOption`的标准接口————`/list`、结合`labelKey`和`valKey`构造选项数组。
> 你还能利用`FastTableOption`的`conds`属性配置过滤条件。

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

## FastTableColumnTextarea

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
