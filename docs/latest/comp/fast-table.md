# FastTable

**FastTable是FastCrud前端部分最核心的组件，没有之一**。

## 状态{#status}

:::tip
FastTable组件内部有三种状态(status):

- `insert`：当处于新建数据时, 即点击”新建“按钮，插入了空行时
- `update`：当处于更新数据时, 即双击某个行导致其处于编辑状态(或批量编辑时)
- `normal`：表格未处于编辑状态时

:::

FastTable提供了丰富的配置、插槽、方法。

## 配置

由于FastTable配置项非常多, 因此没有采用都通过prop进行配置，而是提供一个唯一的prop——`option`
，其类型为FastCrud自定义的类`FastTableOption`。参考以下例子:

```vue

<template>
  <fast-table :option="tableOption">
    <!-- 省略列组件 -->
  </fast-table>
</template>
<script>
  import {FastTableOption} from "fast-crud-ui3";

  export default {
    data() {
      return {
        tableOption: new FastTableOption({
          // 在这里提供FastTable支持的丰富配置项
        })
      }
    }
  }
</script>
```

:::tip
关于FastTableOption支持的配置项，详见[FastTableOption](/latest/advance/fast-table-option)。
:::

## 插槽

除了默认插槽，FastTable还提供了3个插槽用于扩展: `quickFilter`、`button`、`foot`

| 插槽名         | 说明      | 类型                                                                                        |
|-------------|---------|-------------------------------------------------------------------------------------------|
| default     | 列组件     | -                                                                                         |
| quickFilter | 自定义快筛   | `{query: PageQuery, size: String, choseRow: Object, checkedRows: Array, editRows: Array}` |
| button      | 自定义功能按钮 | `{query: PageQuery, size: String, choseRow: Object, checkedRows: Array, editRows: Array}` |
| foot        | 自定义功能按钮 | `{query: PageQuery, size: String, choseRow: Object, checkedRows: Array, editRows: Array}` |

:::tip

1. 针对`quickFilter`插槽扩展的自定义快筛项, 可以利用`grid-area`对自定义快筛项进行定位。grid区域命名规则是: 第一行 a1,a2,a3, ..; 第二行 b1,b2,b3,..。此项`1.5.9+`支持
2. 上面插槽参数中, query参数是`1.5.12`支持的, 你可以将query.extra.yourCustomQueryParam绑定到插槽扩展的控件中(FastTable会为你支持reset和参数缓存等)

:::

## 事件

| 事件名              | 说明                          | 类型                                                 |
|------------------|-----------------------------|----------------------------------------------------|
| current-change   | 选择行发生变更                     | `Function<({fatRow, row}) => void>`                |
| select           | 当用户手动勾选数据行的 Checkbox 时触发的事件 | `Function<({fatRows, rows, fatRow, row}) => void>` |
| selection-change | 当选择项发生变化时会触发该事件             | `Function<({fatRows, rows}) => void>`              |
| select-all       | 当用户手动勾选全选 Checkbox 时触发的事件   | `Function<({fatRows, rows}) => void>`              |
| row-click        | 当某一行被点击时会触发该事件              | `Function<({fatRow, column, event, row}) => void>` |
| row-dblclick     | 当某一行被双击时会触发该事件              | `Function<({fatRow, column, event, row}) => void>` |

## 方法

| 方法名              | 说明                         | 类型                              |
|------------------|----------------------------|---------------------------------|
| addRow           | 新建一行，表格进入新增状态              | `Function<(row) => void>`       |
| addRows          | 新建多行，表格进入新增状态              | `Function<(rows) => void>`      |
| addForm          | 弹窗新增，表格进入新增状态              | `Function<(row) => void>`       |
| updateForm       | 弹窗更新指定行，表格进入更新状态           | `Function<(fatRow) => void>`    |
| reRender         | 重新渲染表格                     | `Function<() => void>`          |
| pageLoad         | 分页加载                       | `Function<() => void>`          |
| resetFilter      | 重置筛选条件并分页请求                | `Function<() => void>`          |
| deleteRow        | 删除当前选中行                    | `Function<() => void>`          |
| deleteRows       | 删除当前勾选行                    | `Function<() => void>`          |
| setChoseRow      | 手动设置选中行                    | `Function<(index) => void>`     |
| getChoseRow      | 获取选中行                      | `Function<() => FatRow>`        |
| getCheckedRows   | 获取勾选行                      | `Function<() => Array<FatRow>>` |
| activeBatchEdit  | 激活批量编辑                     | `Function<() => void>`          |
| cancelEditStatus | 取消编辑(会触发beforeCancel钩子)    | `Function<() => void>`          |
| exitEditStatus   | 退出编辑状态(不会触发beforeCancel钩子) | `Function<() => void>`          |
