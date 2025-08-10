# FastCheckboxGroup

`fast-checkbox-group`和`fast-select`初衷相同, 是一个可独立使用的勾选选项组控件，基于`el-checkbox-group`,
只是为了简化使用封装了一层，它支持额外的几个属性(几乎和FastSelect相同)。

## 属性

| 属性           | 说明                        | 类型                               | 默认值     |
|--------------|---------------------------|----------------------------------|---------|
| options      | 选项数组                      | `Array<Object>`                  | `[]`    |
| labelKey     | 标识options中对象里作为label显示的键名 | `String`                         | `label` |
| valueKey     | 标识options中对象里作为value值的键名  | `String`                         | `value` |
| disableVal   | 标识选项里哪些值禁用，禁用的选项无法点选      | `Array<String\|Number\|Boolean>` | `[]`    |
| showChoseAll | 是否显示"全选"勾选框               | `Boolean`                        | `true`  |

