# pick

`pick`方法是FastCrud提供的一个纯js的弹窗选数据的js API。
> 它借助了`openDialog`和`FastTable`实现。

## 为什么要提供这个方法?

试想, 当我们要选择其他表中的某个或多个数据, 并处理再回填到当前页面时, 通常我们是怎么做的？ 通常两种方案:

1. 前端控件采用`el-select`, 而下拉数据源options通过后端单独提供的接口来获取。
2. 前端弹出一个表格, 在表格中选择数据并返回给原页面——涉及表格的分页、表格勾选逻辑的开发

> 方案1适合数据简单、少的情况, 方案2适合数据量大，且呈现字段多的场景。

无论哪种方案, 都涉及前后端开发工作量, **但"pick另一张表的数据"分明是一个非常常见，且逻辑非常标准的行为, 如果能抽取成一个API方法,
不用再关注实现细节那不是很香! 而恰好, FastCrud提供了FastTable这样的标准表格实现, 基于方案2封装成标准API水到渠成**
——这就是`pick`方法。

## pick方法参数

`pick`支持一个对象参数, 这个对象里支持三个配置项, 分别是:

| 属性       | 说明                                                                                                                                                           | 类型                | 默认值              |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|------------------|
| option   | 这是一个[FastTableOption](/latest/advance/fast-table-option)实例, 这个参数足够描述弹窗的表格内容                                                                                  | `FastTableOption` | -                |
| multiple | 弹窗后的表格是否支持多选                                                                                                                                                 | `Boolean`         | `false`          |
| dialog   | 弹窗自身的配置,参考openDialog中的[dialogProps](/latest/advance/open-dialog#dialogProps)。`pick`方法内部会默认提供`dialog`里的`buttons`配置, 从而实现弹窗后的"确定"和"取消"按钮及逻辑，因此你无需配置其中的buttons。 | `Object`          | `{width: '70%'}` |

看下面完整例子:

```vue

<template>
  <div>
    <el-button @click="pickStudent">拣选</el-button>
  </div>
</template>
<script setup>
  import {h} from 'vue'
  import {pick, FastTableOption, FastTableColumn, FastTableColumnNumber, FastTableColumnDatePicker} from 'fast-crud-ui3'

  const studentTableOption = new FastTableOption({
    module: 'student',
    // conds: [], // 你甚至可以内置一些查询条件(它们无法被用户取消)
    render() {
      return [
        h(FastTableColumn, {prop: 'id', label: 'ID'}),
        h(FastTableColumn, {prop: 'name', label: '姓名'}),
        h(FastTableColumnNumber, {prop: 'age', label: '年龄'}),
        h(FastTableColumnDatePicker, {prop: 'createTime', label: '创建时间'}),
      ]
    }
  })
  const pickStudent = () => {
    pick({
      option: studentTableOption,
      multiple: false,
      dialog: {
        width: '80%'
      }
    }).then(data => {
      // data即为选择的那条学生记录, 如果multiple为true, 则data为数组
    }).catch(() => {
      // 取消了
    })
  }
</script>
```

:::tip
如果你阅读过[`FastTable`](/latest/comp/fast-table)和[`FastTableOption`](/latest/advance/fast-table-option)章节,
那你应该意识到弹出的表格拥有`FastTable`的所有筛选功能(动筛、简筛等), 这太爽了不是吗!

不用担心弹出的表格是否也会带有编辑功能, 因为它是只读的。
:::
