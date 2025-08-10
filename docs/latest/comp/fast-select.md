# FastSelect

`fast-select`是一个可独立使用的下拉控件，基于`el-select`, 只是为了简化使用封装了一层，它支持额外的几个属性。

## 属性

| 属性         | 说明                        | 类型                               | 默认值     |
|------------|---------------------------|----------------------------------|---------|
| options    | 选项数组                      | `Array<Object>`                  | `[]`    |
| labelKey   | 标识options中对象里作为label显示的键名 | `String`                         | `label` |
| valueKey   | 标识options中对象里作为value值的键名  | `String`                         | `value` |
| disableVal | 标识选项里哪些值禁用，禁用的选项无法点选      | `Array<String\|Number\|Boolean>` | `[]`    |

