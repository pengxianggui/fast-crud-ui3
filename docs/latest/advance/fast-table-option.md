# FastTableOption

FastTableOption是FastCrud自定义的类，其构造参数是一个对象类型。示例如下：

```js
import {FastTableOption} from "fast-crud-ui3";

const tableOption = new FastTableOption({
    // 在这里提供FastTable支持的丰富配置项
    module: ''
})
```

:::tip
FastTableOption必须配合[FastTable](/latest/comp/fast-table)组件使用
:::

## FastTableOption配置项

| 属性                      | 说明                                                         | 类型                                                        | 默认值                                                                                                 |
|-------------------------|------------------------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| context                 | 当前组件的引用，一般配this。否则，在钩子函数中无法正常获取当前组件数据或方法                   | `Component`                                               | -                                                                                                   |
| id(`1.5.2+`)            | 表格id,应当保证同站点唯一。此值将用于`FastTable`在localStorage中存储某些数据时标识唯一性  | `String`                                                  | `${baseUrl}`                                                                                        |
| title                   | 表格标题名。配置后将显示在表格上方                                          | `String`                                                  | -                                                                                                   |
| module                  | 模块，也即后端接口的根path。(`@deprecate 1.6`, 使用baseUrl代替)            | `String`                                                  | -                                                                                                   |
| baseUrl(`1.5.2+`)       | 其它接口url的根path                                              | `String`                                                  | `${module}`                                                                                         |
| pageUrl                 | 分页接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/page`                                                                                   |
| listUrl                 | 列表接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/list`                                                                                   |
| insertUrl               | 新增接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/insert`                                                                                 |
| batchInsertUrl          | 批量新增接口地址。如需自定义则配置                                          | `String`                                                  | `${baseUrl}/insert/batch`                                                                           |
| updateUrl               | 更新接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/update`                                                                                 |
| batchUpdateUrl          | 批量更新接口地址。如需自定义则配置                                          | `String`                                                  | `${baseUrl}/update/batch`                                                                           |
| deleteUrl               | 删除接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/delete`                                                                                 |
| batchDeleteUrl          | 批量删除接口地址。如需自定义则配置                                          | `String`                                                  | `${baseUrl}/delete/batch`                                                                           |
| uploadUrl               | 上传接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/upload`                                                                                 |
| exportUrl               | 导出接口地址。如需自定义则配置                                            | `String`                                                  | `${baseUrl}/export`                                                                                 |
| enableDblClickEdit      | 启用双击编辑                                                     | `Boolean`                                                 | true                                                                                                |
| enableMulti             | 启用多选                                                       | `Boolean`                                                 | true                                                                                                |
| enableColumnFilter      | 启用列动筛。若设置false则所有列不支持表头点击筛选                                | `Boolean`                                                 | true                                                                                                |
| lazyLoad                | 分页数据延迟加载。若设置true则表格渲染后不会自动加载数据，得人为触发                       | `Boolean`                                                 | false                                                                                               |
| editType                | 双击编辑时默认的编辑形式。"inline"表示表格行内编辑, "form"表示弹窗表单                | `String`                                                  | inline                                                                                              |
| insertable              | 是否可新增。若为false则关闭所有新增入口                                     | `Boolean`/`Function<() => Boolean>`                       | true                                                                                                |
| updatable               | 是否可更新。若为false则关闭所有更新入口                                     | `Boolean`/`Function<() => Boolean>`                       | true                                                                                                |
| deletable               | 是否可删除。若为false则关闭所有删除入口                                     | `Boolean`/`Function<() => Boolean>`                       | true                                                                                                |
| createTimeField         | 创建时间字段。若配置则默认按此倒序，并激活内置存筛                                  | `String`                                                  | -                                                                                                   |
| sortField               | 排序字段                                                       | `String`                                                  | `${createTimeField}`                                                                                |
| sortDesc                | 是否倒序                                                       | `Boolean`                                                 | true                                                                                                |
| style                   | 表格样式。详见[style](#style)                                     | `Object`                                                  | -                                                                                                   |
| conds                   | 分页内置条件, 用户无法取消。详见[conds](#conds)                           | `Array`                                                   | `[]`                                                                                                |
| condGroups(`1.5.2+`)    | 开发预置的存筛筛选组。详见[condGroups](#condgroups)                     | `Array`                                                   | `[]`                                                                                                |
| moreButtons             | "更多"下拉按钮的扩展配置。详见[moreButtons](#morebuttons)                | `Array`                                                   | -                                                                                                   |
| pagination              | 分页配置。参考Element即可                                           | `Object`                                                  | `{layout: 'total, sizes, prev, pager, next, jumper','page-sizes': [10, 20, 50, 100, 200],size: 10}` |
| beforeReset             | 【钩子】搜索重置前执行。返回reject则阻断重置                                  | `Function<({query}) => Promise>`                          | `({query}) => Promise.resolve()`                                                                    |
| beforeLoad              | 【钩子】分页请求前执行。返回reject则阻断分页请求，可针对查询条件进行扩展                    | `Function<({query}) => Promise>`                          | `({query}) => Promise.resolve()`                                                                    |
| loadSuccess             | 【钩子】分页请求成功后执行。可针对响应数据进行显示前的二次处理(必须resolve数据)               | `Function<({query, res}) => Promise>`                     | `({query, res}) => Promise.resolve(res)`                                                            |
| loadFail                | 【钩子】分页请求失败后执行。返回reject则阻断内置错误提示                            | `Function<({query, error}) => Promise>`                   | `({query, error}) => Promise.resolve()`                                                             |
| beforeToInsert          | 【钩子】新增状态激活前执行。返回reject则阻断进入新增状态。可定制某些字段新增时默认值(必须返回resolve) | `Function<({rows}) => Promise>`                           | `({rows}) => Promise.resolve()`                                                                     |
| beforeInsert            | 【钩子】新增保存前执行。返回reject则阻断保存提交。可实现特殊逻辑校验。                     | `Function<({fatRows, rows, editRows}) => Promise>`        | `({fatRows, rows, editRows}) => Promise.resolve(editRows)`                                          |
| insertSuccess           | 【钩子】新增保存成功后执行。返回reject则阻断内置成功提示                            | `Function<({fatRows, rows, editRows, res}) => Promise>`   | `({fatRows, rows, editRows, res}) => Promise.resolve()`                                             |
| insertFail              | 【钩子】新增保存失败后执行。返回reject则阻断内置错误提示                            | `Function<({fatRows, rows, editRows, error}) => Promise>` | `({fatRows, rows, editRows, error}) => Promise.resolve()`                                           |
| beforeToUpdate          | 【钩子】更新状态激活前执行。返回reject则阻断进入编辑状态                            | `Function<({fatRows, rows}) => Promise>`                  | `({fatRows, rows}) => Promise.resolve()`                                                            |
| beforeUpdate            | 【钩子】更新保存前执行。返回reject则阻断保存提交。可实现特殊逻辑校验                      | `Function<({fatRows, rows, editRows}) => Promise>`        | `({fatRows, rows, editRows}) => Promise.resolve(editRows)`                                          |
| updateSuccess           | 【钩子】更新成功后执行。返回reject则阻断内置成功提示                              | `Function<({fatRows, rows, editRows, res}) => Promise>`   | `({fatRows, rows, editRows, res}) => Promise.resolve()`                                             |
| updateFail              | 【钩子】更新失败后执行。返回reject则阻断内置失败提示                              | `Function<({fatRows, rows, editRows, error}) => Promise>` | `({fatRows, rows, editRows, error}) => Promise.resolve()`                                           |
| beforeDeleteTip         | 【钩子】删除提示前执行。返回reject则阻断提示弹窗及后续操作                           | `Function<({fatRows, rows}) => Promise>`                  | `({fatRows, rows}) => Promise.resolve()`                                                            |
| beforeDelete            | 【钩子】删除请求前执行。返回reject则阻断删除请求，否则必须resolve数据                  | `Function<({fatRows, rows}) => Promise>`                  | `({fatRows, rows}) => Promise.resolve(rows)`                                                        |
| deleteSuccess           | 【钩子】删除成功后执行。返回reject则阻断内置成功提示                              | `Function<({fatRows, rows, res}) => Promise>`             | `({fatRows, rows, res}) => Promise.resolve()`                                                       |
| deleteFail              | 【钩子】删除失败后执行。返回reject则阻断内置失败提示                              | `Function<({fatRows, rows, error}) => Promise>`           | `({fatRows, rows, error}) => Promise.resolve()`                                                     |
| beforeCancel            | 【钩子】取消前——即退出新增或更新状态前执行。返回reject则阻断退出新增或更新状态                | `Function<({fatRows, rows, status}) => Promise>`          | `({fatRows, rows, status}) => Promise.resolve()`                                                    |
| beforeExport            | 【钩子】导出请求前执行。返回reject则阻断导出                                  | `Function<({columns, pageQuery}) => Promise>`             | `({columns, pageQuery}) => Promise.resolve()`                                                       |
| exportSuccess(`1.5.1+`) | 【钩子】导出成功后执行                                                | `Function<({columns, pageQuery, data}) => Promise>`       | `({columns, pageQuery, data}) => Promise.resolve()`                                                 |
| exportFail(`1.5.1+`)    | 【钩子】导出失败后执行。返回reject则组件内置失败提示                              | `Function<({columns, pageQuery, data}) => Promise>`       | `({columns, pageQuery, data}) => Promise.resolve()`                                                 |
| render                  | 渲染函数。用于渲染FastTable子组件                                      | `Function<() => []>`                                      | `() => []`                                                                                          |

### style

`style`是FastTableOption中定义表格“外貌”的配置项，它是一个`Object`类型，其下具体配置如下:
| 属性 | 说明 | 类型 | 默认值 |
|----------|----------|------------|----------------|
|flexHeight|表格是否使用弹性高度。为true则自适应高度, 撑满父容器|`Boolean`|false|
|bodyRowHeight|表格行高|`String`|`50px`|
|size|尺寸。将影响表格内所有相关控件，取值参考Element| `String` |`default`|
|formLabelWidth|表单标签宽度。影响范围: 弹窗表单、快筛表单| `String` |`auto`|
|formLayout|弹窗表单的字段布局, 例如:`id,avatarUrl,name\|age\|sex,createTime`表示第一行是id和avatarUrl各占50%,第二行是name、age、sex各占33.3%, 第三行是createTime独占一行| `String` | - |
|quickFilterToggle|快筛项过多时，是否折叠| `Boolean` |false|
|quickFilterToggleExceed|quickFilterToggle为true时, 快筛项多于此值时产生"收缩/展开"| `Number` |4|
|quickFilterSpan|快筛表单的布局, 表示每行几个筛选项| `Number` |3|

### conds

`conds`接受一个数组，如下:

```js
conds: [{col: 'name', opt: '=', val: '曹操'}] // 此时opt可以省略
// 或
conds: new Cond('name', '=', '曹操') // 此时第二个参数opt不能省略
```

关于opt的取值详见[Cond](/latest/advance/cond#opt)

### condGroups

开发者可以通过此配置项预置一个或多个存筛(即筛选组)，这些存筛项目，用户无法修改和删除。`condGroups`接受一个数组，数组中的配置项如下:
| 属性 | 说明 | 类型 | 默认值 |
|----------|----------|------------|----------------|
|label|组合名, 存筛项下拉处显示名, 应保证唯一且尽量言简意赅|`String`|-|
|conds|条件组，详见上面的[conds](#conds)|`Array`|-|

:::warning
在迭代过程中, `FastTable`可能会不断变化, 某个筛选属性可能以前有，现在没了，也记得调整此condGroups值，否则这个存筛项会被标记为不兼容，呈现禁用状态。
:::

### moreButtons

`moreButtons`是针对"更多"下拉按钮的扩展配置，这个配置项接受一个数组，数组中的配置项如下:
| 属性 | 说明 | 类型 | 默认值 |
|----------|----------|------------|----------------|
|icon|图标组件, 建议用`markRaw`处理|`Component`|-|
|label|显示名|`String`|-|
|click|点击后触发的函数回调,通过scope参数可以获取到表格中选中、勾选等数据|`Function<(scope) => void>`|-|
|showable|是否显示|`Boolean`/`Function<(scope) => Boolean>`|true|
|disable|是否禁用|`Boolean`/`Function<(scope) => Boolean>`|true|
