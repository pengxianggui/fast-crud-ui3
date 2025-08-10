# FastObjectPicker

众所周知, `DatePicker`是选日期, 而`FastObjectPicker`—— 顾名思义——就是选一个对象。

## 属性

| 属性           | 说明                                                                                                     | 类型                                       | 默认值                       |
|--------------|--------------------------------------------------------------------------------------------------------|------------------------------------------|---------------------------|
| tableOption  | 弹出的表格的tableOption配置实例, 详见[TableOption](/latest/advance/fast-table-option)                              | `FastTableOption`                        | -                         |
| showField    | 声明从表格中选择的数据要回显到`FastObjectPicker`控件上的字段名                                                               | `String`                                 | -                         |
| valueCovert  | 针对showField取值的值转换。比如,多选时, 会将showField的多个值用英文逗号分隔后返回，作为组件v-model值                                       | `Function<(pickData, showField) => any>` | -                         |
| pickObject   | 单选时, pick选择后回填到的目标object, 比如一般`FastObjectPicker`处在一个form中, 这个pickObject就是form的表单data, 此配置配合`pickMap`使用 | `Object`                                 | -                         |
| pickMap      | 单选时, pick选择后回填到pickObject上时，指导字段对应关系: key为弹窗表格中数据的字段名, value为pickObject中的字段名, 此配置配合`pickObject`使用      | `Object`                                 | -                         |
| beforeOpen   | 弹窗打开前执行, 返回reject不会打开弹窗                                                                                | `Function<() => Promise>`                | `() => Promise.resolve()` |
| multiple     | 弹窗的表格是否支持多选                                                                                            | `Boolean`                                | `false`                   |
| placeholder  | placeholder提示                                                                                          | `String`                                 | `请点选`                     |
| disabled     | 控件是否禁用                                                                                                 | `Boolean`                                | `false`                   |
| clearable    | 控件是否支持清空, 由于点击即触发弹窗, 因此除非不允许置空否则此值最好不要改成false                                                          | `Boolean`                                | `true`                    |
| title        | 弹窗的显示标题                                                                                                | `String`                                 | -                         |
| appendToBody | 弹窗是否appendToBody                                                                                       | `Boolean`                                | `true`                    |
| dialogWidth  | 弹窗宽度                                                                                                   | `String`                                 | `70%`                     |

## 事件

| 事件名    | 说明                                 | 类型                          |
|--------|------------------------------------|-----------------------------|
| change | 值变更时                               | `Function<(val) => void>`   |
| blur   | 失焦时                                | `Function<(event) => void>` |
| clear  | 点击clearable生成的清空按钮时                | `Function<(event) => void>` |
| click  | 点击时(监听此值不会改变弹窗行为, 请通过beforeOpen控制) | `Function<(event) => void>` |
| focus  | 获得焦点时(获得焦点不会弹出)                    | `Function<(event) => void>` |

可以将它理解为增强版本的`FastSelect`, 只是`FastSelect`交互形式是下拉, 呈现数据有限，而`FastObjectPicker`交互形式是
弹一个表格窗口, 一个拥有完整筛选功能的`FastTable`。 
