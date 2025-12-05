# FastSelect

`fast-select`是一个可独立使用的下拉控件，基于`el-select`, 只是为了简化使用封装了一层，它支持额外的几个属性。

## 属性

| 属性         | 说明                                                | 类型                               | 默认值     |
|------------|---------------------------------------------------|----------------------------------|---------|
| options    | 提供的下拉选项。可以是静态对象数组, 或者一个FastTableOption(`1.5.16+`) | `Array<Object>\|FastTableOption` | `[]`    |
| labelKey   | 标识options中对象里作为label显示的键名                         | `String`                         | `label` |
| valueKey   | 标识options中对象里作为value值的键名                          | `String`                         | `value` |
| disableVal | 标识选项里哪些值禁用，禁用的选项无法点选                              | `Array<String\|Number\|Boolean>` | `[]`    |

> 对于options而言。在`1.5.16+`开始支持一个`FastTableOption`对象，内部将基于`FastTableOption`的标准接口————`/list`、结合`labelKey`和`valKey`构造选项数组。
> 你还能利用`FastTableOption`的`conds`属性配置过滤条件。
